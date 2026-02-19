import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

const schema = yup.object().shape({
    username: yup.string().required('Username kiritilishi shart').min(3, 'Kamida 3 ta belgi bo\'lishi kerak').max(50),
    email: yup.string().email('Noto\'g\'ri email format').required('Email kiritilishi shart'),
    password: yup.string().required('Parol kiritilishi shart').min(6, 'Kamida 6 ta belgi bo\'lishi kerak'),
    confirmPassword: yup.string().oneOf([yup.ref('password')], 'Parollar mos kelmadi').required('Parolni tasdiqlang'),
});

const RegisterPage: React.FC = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await registerUser({
                username: data.username,
                email: data.email,
                password: data.password,
            });
            toast.success('Ro\'yxatdan o\'tdingiz! Emailingizni tasdiqlang.');
            navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Ro'yxatdan o'tish</h2>
                <p className="text-slate-400 mt-2 text-sm italic">O'zbek adabiyoti olamiga xush kelibsiz</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Foydalanuvchi nomi</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            {...register('username')}
                            type="text"
                            placeholder="username"
                            className={`input-field pl-10 ${errors.username ? 'border-red-500/50' : ''}`}
                        />
                    </div>
                    {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="example@mail.com"
                            className={`input-field pl-10 ${errors.email ? 'border-red-500/50' : ''}`}
                        />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Parol</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className={`input-field pl-10 ${errors.password ? 'border-red-500/50' : ''}`}
                        />
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Parolni tasdiqlash</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            {...register('confirmPassword')}
                            type="password"
                            placeholder="••••••••"
                            className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500/50' : ''}`}
                        />
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Davom etish'}
                </button>
            </form>

            <div className="text-center mt-4">
                <p className="text-sm text-slate-400">
                    Hisobingiz bormi?{' '}
                    <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium">
                        Kirish
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
