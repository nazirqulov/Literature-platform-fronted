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
            <h3 className="text-lg font-bold text-[#2B2B2B] uppercase tracking-wider border-b border-[#E3DBCF] pb-2">
                {title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {books.map((book, idx) => (
                    <div key={idx} className="glass p-4 rounded-xl flex items-center gap-4 hover:bg-white transition-colors group">
                        <div className="w-12 h-16 bg-white rounded-md flex-shrink-0 animate-pulse group-hover:bg-[#6B4F3A]/10" />
                        <div>
                            <p className="font-semibold text-[#2B2B2B]">{book.title}</p>
                            <p className="text-sm text-[#6B6B6B]">{book.author}</p>
                        </div>
                    </div>
                ))}
                {books.length === 0 && (
                    <p className="text-sm text-[#9A9A9A] italic">Hozircha kitoblar yo'q</p>
                )}
            </div>
        </div>
    );
};

export default BookList;


