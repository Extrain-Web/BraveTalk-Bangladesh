'use client';

import { useParams } from 'next/navigation';
import BookForm from '@/components/Admin/books/BookForm';

// Loads the book via booksApi.adminGet(id) inside BookForm.
const EditBookPage = () => {
  const { id } = useParams();
  return <BookForm mode="edit" bookId={id} />;
};

export default EditBookPage;
