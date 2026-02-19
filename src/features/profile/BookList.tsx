import React from 'react';

interface Book {
    title: string;
    author: string;
}

interface BookListProps {
    title: string;
    books: Book[];
}

const BookList: React.FC<BookListProps> = ({ title, books }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                {title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {books.map((book, idx) => (
                    <div key={idx} className="glass p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors group">
                        <div className="w-12 h-16 bg-white/5 rounded-md flex-shrink-0 animate-pulse group-hover:bg-amber-500/10" />
                        <div>
                            <p className="font-semibold text-white">{book.title}</p>
                            <p className="text-sm text-slate-400">{book.author}</p>
                        </div>
                    </div>
                ))}
                {books.length === 0 && (
                    <p className="text-sm text-slate-500 italic">Hozircha kitoblar yo'q</p>
                )}
            </div>
        </div>
    );
};

export default BookList;
