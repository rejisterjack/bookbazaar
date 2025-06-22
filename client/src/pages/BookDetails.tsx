
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Star, ShoppingCart, ArrowLeft, MessageCircle, Trash2 } from 'lucide-react';
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
  imageUrl?: string;
}

interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [newReview, setNewReview] = useState({ rating: '', comment: '' });
  const { addToCart } = useCart();
  const { user, token, apiKey } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: book, isLoading: bookLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        headers: apiKey ? { 'X-API-Key': apiKey } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch book');
      return response.json();
    },
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/books/${id}/reviews`, {
        headers: apiKey ? { 'X-API-Key': apiKey } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      const response = await fetch(`${API_BASE_URL}/books/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error('Failed to add review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      setNewReview({ rating: '', comment: '' });
      toast({
        title: "Review added",
        description: "Thank you for your feedback!",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add review",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete review');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      toast({
        title: "Review deleted",
        description: "Your review has been removed",
      });
    },
  });

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add a review",
        variant: "destructive",
      });
      return;
    }
    addReviewMutation.mutate({
      rating: parseInt(newReview.rating),
      comment: newReview.comment,
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (bookLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-8 w-1/4"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Book Not Found</h2>
        <Link to="/books">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/books">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </Button>
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative">
          <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
            {book.imageUrl ? (
              <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-9xl">📚</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Badge className="mb-2 bg-gradient-to-r from-blue-500 to-purple-500">
              {book.genre}
            </Badge>
            <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
            
            {reviews.length > 0 && (
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-lg font-medium">{averageRating.toFixed(1)}</span>
                <span className="ml-1 text-gray-500">({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          {book.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between py-4 border-t border-b">
            <div>
              <span className="text-3xl font-bold text-green-600">${book.price.toFixed(2)}</span>
              <p className="text-sm text-gray-500">{book.stock} in stock</p>
            </div>
            
            <Button
              onClick={() => addToCart(book.id, book)}
              disabled={book.stock === 0}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold flex items-center">
          <MessageCircle className="h-8 w-8 mr-3" />
          Reviews ({reviews.length})
        </h2>

        {/* Add Review Form */}
        {user && (
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <Select value={newReview.rating} onValueChange={(value) => setNewReview(prev => ({ ...prev, rating: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <Textarea
                    placeholder="Share your thoughts about this book..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!newReview.rating || !newReview.comment || addReviewMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review: Review) => (
              <Card key={review.id} className="border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="font-semibold mr-3">{review.username}</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {user && (user.id === review.userId || user.isAdmin) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review this book!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
