
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, BookOpen, DollarSign, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_BASE_URL = 'http://localhost:5000';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  stock: number;
  description?: string;
}

const Admin = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    genre: '',
    price: '',
    stock: '',
    description: '',
  });

  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['admin-books'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/books`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch books');
      return response.json();
    },
  });

  const createBookMutation = useMutation({
    mutationFn: async (bookData: any) => {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...bookData,
          price: parseFloat(bookData.price),
          stock: parseInt(bookData.stock),
        }),
      });
      if (!response.ok) throw new Error('Failed to create book');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Book created",
        description: "The book has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create book",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: async ({ id, ...bookData }: any) => {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...bookData,
          price: parseFloat(bookData.price),
          stock: parseInt(bookData.stock),
        }),
      });
      if (!response.ok) throw new Error('Failed to update book');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      setEditingBook(null);
      resetForm();
      toast({
        title: "Book updated",
        description: "The book has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update book",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete book');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      toast({
        title: "Book deleted",
        description: "The book has been removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete book",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setBookForm({
      title: '',
      author: '',
      genre: '',
      price: '',
      stock: '',
      description: '',
    });
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      price: book.price.toString(),
      stock: book.stock.toString(),
      description: book.description || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      updateBookMutation.mutate({ id: editingBook.id, ...bookForm });
    } else {
      createBookMutation.mutate(bookForm);
    }
  };

  const genres = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Biography', 'History', 'Classic'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Panel
        </h1>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={bookForm.title}
                    onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={bookForm.author}
                    onChange={(e) => setBookForm(prev => ({ ...prev, author: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={bookForm.genre} onValueChange={(value) => setBookForm(prev => ({ ...prev, genre: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={bookForm.price}
                    onChange={(e) => setBookForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={bookForm.stock}
                    onChange={(e) => setBookForm(prev => ({ ...prev, stock: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={bookForm.description}
                  onChange={(e) => setBookForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBookMutation.isPending}>
                  {createBookMutation.isPending ? 'Creating...' : 'Create Book'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-3xl font-bold text-blue-600">{books.length}</p>
              </div>
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-green-600">
                  ${books.reduce((sum: number, book: Book) => sum + (book.price * book.stock), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-3xl font-bold text-purple-600">
                  {books.reduce((sum: number, book: Book) => sum + book.stock, 0)}
                </p>
              </div>
              <Package className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Books Table */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Books Management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border-b">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Title</th>
                    <th className="text-left p-4 font-semibold">Author</th>
                    <th className="text-left p-4 font-semibold">Genre</th>
                    <th className="text-left p-4 font-semibold">Price</th>
                    <th className="text-left p-4 font-semibold">Stock</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book: Book) => (
                    <tr key={book.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{book.title}</td>
                      <td className="p-4 text-gray-600">{book.author}</td>
                      <td className="p-4">
                        <Badge variant="secondary">{book.genre}</Badge>
                      </td>
                      <td className="p-4 font-semibold text-green-600">${book.price.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          book.stock > 10 ? 'bg-green-100 text-green-800' :
                          book.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {book.stock} units
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(book)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Book</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Same form fields as add dialog */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-title">Title</Label>
                                    <Input
                                      id="edit-title"
                                      value={bookForm.title}
                                      onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-author">Author</Label>
                                    <Input
                                      id="edit-author"
                                      value={bookForm.author}
                                      onChange={(e) => setBookForm(prev => ({ ...prev, author: e.target.value }))}
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label htmlFor="edit-genre">Genre</Label>
                                    <Select value={bookForm.genre} onValueChange={(value) => setBookForm(prev => ({ ...prev, genre: value }))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select genre" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {genres.map((genre) => (
                                          <SelectItem key={genre} value={genre}>
                                            {genre}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-price">Price</Label>
                                    <Input
                                      id="edit-price"
                                      type="number"
                                      step="0.01"
                                      value={bookForm.price}
                                      onChange={(e) => setBookForm(prev => ({ ...prev, price: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-stock">Stock</Label>
                                    <Input
                                      id="edit-stock"
                                      type="number"
                                      value={bookForm.stock}
                                      onChange={(e) => setBookForm(prev => ({ ...prev, stock: e.target.value }))}
                                      required
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="edit-description">Description (Optional)</Label>
                                  <Textarea
                                    id="edit-description"
                                    value={bookForm.description}
                                    onChange={(e) => setBookForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                  />
                                </div>

                                <div className="flex justify-end space-x-2">
                                  <Button type="button" variant="outline" onClick={() => setEditingBook(null)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={updateBookMutation.isPending}>
                                    {updateBookMutation.isPending ? 'Updating...' : 'Update Book'}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteBookMutation.mutate(book.id)}
                            disabled={deleteBookMutation.isPending}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
