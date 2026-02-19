import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { toast } from 'react-toastify';
import { Loader2, Mail } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const { verifyEmail } = useAuth();
    const navigate = useNavigate();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const data = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(data)) return;

        const newOtp = [...otp];
        data.split('').forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(data.length, 5)]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            toast.warn('Iltimos, 6 xonali kodni to\'liq kiriting');
            return;
        }

        setIsLoading(true);
        try {
            await verifyEmail({ email, code });
            toast.success('Email muvaffaqiyatli tasdiqlandi! Endi tizimga kirishingiz mumkin.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Kod noto\'g\'ri yoki muddati o\'tgan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                    <Mail className="text-amber-500" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Emailni tasdiqlash</h2>
                <p className="text-slate-400 mt-2 text-sm">
                    Kod <span className="text-amber-500 font-medium">{email}</span> manziliga yuborildi
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            value={data}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all focus:ring-1 focus:ring-amber-500/50"
                        />
                    ))}
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Tasdiqlash'}
                </button>

                <div className="text-center">
                    <button type="button" className="text-sm text-slate-400 hover:text-amber-500 transition-colors">
                        Kodni qayta yuborish
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VerifyEmailPage;

