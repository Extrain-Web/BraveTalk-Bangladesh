'use client';

import BookForm from '@/components/Admin/books/BookForm';

// Create & Edit share the same form — see components/Admin/books/BookForm.jsx
const CreateBookPage = () => <BookForm mode="create" />;

export default CreateBookPage;
