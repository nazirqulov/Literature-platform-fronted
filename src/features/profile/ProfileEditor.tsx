import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/useAuth";
import type { UpdateProfileRequest, UserResponse } from "../../types";
import type { AxiosError } from "axios";
import {
  AlertCircle,
  AtSign,
  Phone,
  RefreshCcw,
  Save,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

const uzbekPhoneRegex = /^\+998\d{9}$/;

const useDebouncedCallback = (callback: () => void, delay = 180) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(callback, delay);
  };
};

const ProfileEditor: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile, refreshUser } = useAuth();

  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<UpdateProfileRequest | null>(
    null,
  );

  const validationSchema = useMemo(
    () =>
      yup.object({
        username: yup.string().required("Foydalanuvchi nomi shart").min(3, "Kamida 3 ta belgi"),
        email: yup.string().required("Email shart").email("Email formati noto'g'ri"),
        fullName: yup.string().required("To'liq ism shart").min(3, "Kamida 3 ta belgi"),
        phone: yup
          .string()
          .optional()
          .test("uz-phone", "Telefon raqami +998 bilan boshlanishi va 12 ta belgi bo'lishi kerak", (value) =>
            !value || uzbekPhoneRegex.test(value),
          ),
      }),
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    trigger,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UpdateProfileRequest>({
    mode: "onChange",
    resolver: yupResolver(validationSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      phone: "",
    },
  });

  const debouncedValidate = useDebouncedCallback(() => {
    void trigger();
  });

  const usernameField = register("username");
  const emailField = register("email");
  const fullNameField = register("fullName");
  const phoneField = register("phone");

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        const { data } = await api.get<UserResponse>("/api/me");
        if (!active) return;
        reset({
          username: data.username ?? "",
          email: data.email ?? "",
          fullName: data.fullName ?? "",
          phone: data.phone ?? "",
        });
      } catch (error) {
        if (!active) return;
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          navigate("/login");
          return;
        }
        setFetchError("Profil ma'lumotlarini yuklashda xatolik yuz berdi. Qayta urinib ko'ring.");
      } finally {
        if (active) setIsFetching(false);
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [navigate, refreshUser, reset]);

  const handleServerValidation = (axiosError: AxiosError) => {
    const payload = axiosError.response?.data as Record<string, string> | undefined;
    const validationErrors =
      (payload as { errors?: Record<string, string> })?.errors ??
      (payload as { message?: string })?.message;

    if (validationErrors && typeof validationErrors === "object") {
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field as keyof UpdateProfileRequest, {
          type: "server",
          message: String(message),
        });
      });
    }
  };

  const onSubmit = async (payload: UpdateProfileRequest) => {
    setSubmitError(null);
    setLastPayload(payload);
    try {
      await updateProfile(payload);
      reset(payload);
      toast.success("Profil muvaffaqiyatli yangilandi");
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        handleServerValidation(axiosError);
        toast.error("Ma'lumotlarni tekshirib qayta urinib ko'ring");
        return;
      }
      if (axiosError.response?.status === 401) {
        navigate("/login");
        return;
      }
      setSubmitError(
        "Tarmoq xatosi sababli yuborilmadi. Internetni tekshirib, qayta urinib ko'ring.",
      );
    }
  };

  const retrySubmit = () => {
    if (lastPayload) {
      void onSubmit(lastPayload);
    }
  };

  const renderErrorBanner = (message: string, onRetry?: () => void) => (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-100">
      <AlertCircle className="mt-0.5" size={18} />
      <div className="flex-1">{message}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-100 transition hover:bg-red-500/10"
        >
          <RefreshCcw size={14} /> Qayta urinib ko‘rish
        </button>
      )}
    </div>
  );

  if (isFetching) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-black/30">
        <ClipLoader color="#f59e0b" size={36} />
        <p className="text-sm text-slate-300">Profil ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      {fetchError && renderErrorBanner(fetchError, () => window.location.reload())}
      {submitError && renderErrorBanner(submitError, retrySubmit)}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="username">
              Foydalanuvchi nomi
            </label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-2.5 text-slate-500" size={18} />
              <input
                id="username"
                aria-invalid={!!errors.username}
                className="input-field pl-10"
                placeholder="adabiyotchi_uz"
                {...usernameField}
                onChange={(e) => {
                  usernameField.onChange(e);
                  debouncedValidate();
                }}
              />
            </div>
            {errors.username && (
              <p className="text-xs font-medium text-red-300">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-3 top-2.5 text-slate-500" size={18} />
              <input
                id="email"
                type="email"
                aria-invalid={!!errors.email}
                className="input-field pl-10"
                placeholder="siz@example.com"
                {...emailField}
                onChange={(e) => {
                  emailField.onChange(e);
                  debouncedValidate();
                }}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-red-300">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="fullName">
              To‘liq ism
            </label>
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute left-3 top-2.5 text-slate-500" size={18} />
              <input
                id="fullName"
                aria-invalid={!!errors.fullName}
                className="input-field pl-10"
                placeholder="Ism Familiya"
                {...fullNameField}
                onChange={(e) => {
                  fullNameField.onChange(e);
                  debouncedValidate();
                }}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs font-medium text-red-300">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300" htmlFor="phone">
              Telefon raqami (ixtiyoriy)
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-2.5 text-slate-500" size={18} />
              <input
                id="phone"
                type="tel"
                aria-invalid={!!errors.phone}
                className="input-field pl-10"
                placeholder="+998901234567"
                {...phoneField}
                onChange={(e) => {
                  phoneField.onChange(e);
                  debouncedValidate();
                }}
              />
            </div>
            {errors.phone && (
              <p className="text-xs font-medium text-red-300">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertCircle size={14} />
            Ma'lumotlar xavfsiz tarzda yangilanadi. Email va telefon tekshiruvi avtomatik.
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="btn-primary inline-flex min-w-[180px] items-center justify-center gap-2"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <ClipLoader color="#fff" size={16} />
            ) : (
              <>
                <Save size={18} />
                Saqlash
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default React.memo(ProfileEditor);
