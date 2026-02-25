import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/useAuth';
import { toast } from 'react-toastify';
import { Loader2, User as UserIcon, Phone, Save } from 'lucide-react';

const schema = yup.object().shape({
    fullName: yup.string().nullable().min(3, 'Kamida 3 ta belgi bo\'lishi kerak'),
    phone: yup
        .string()
        .nullable()
        .matches(/^\+?[0-9]{7,15}$/, {
            message: 'Telefon raqami noto\'g\'ri formatda',
            excludeEmptyString: true,
        }),
    username: yup.string().required('Username shart'),
    email: yup.string().required('Email shart').email('Email formati noto\'g\'ri'),
});

interface ProfileFormProps {
    initialData: {
        fullName?: string | null;
        phone?: string | null;
        username: string;
        email: string;
    };
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData }) => {
    const { updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            fullName: initialData.fullName || '',
            phone: initialData.phone || '',
            username: initialData.username,
            email: initialData.email,
        },
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await updateProfile(data);
            toast.success('Ma\'lumotlar yangilandi');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#6B6B6B]">To'liq ism (Full Name)</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 text-[#9A9A9A]" size={18} />
                        <input
                            {...register('fullName')}
                            type="text"
                            placeholder="Ism va familiya"
                            className="input-field pl-10"
                        />
                    </div>
                    {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#6B6B6B]">Telefon raqami</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-[#9A9A9A]" size={18} />
                        <input
                            {...register('phone')}
                            type="text"
                            placeholder="+998901234567"
                            className="input-field pl-10"
                        />
                    </div>
                    {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#6B6B6B]">Foydalanuvchi nomi</label>
                    <input
                        {...register('username')}
                        type="text"
                        className="input-field"
                    />
                    {errors.username && <p className="text-red-400 text-xs">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[#6B6B6B]">Email manzili</label>
                    <input
                        {...register('email')}
                        type="email"
                        className="input-field"
                    />
                    {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isLoading || !isDirty}
                    className="btn-primary px-8 flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                            <Save size={20} />
                            O'zgarishlarni saqlash
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ProfileForm;



