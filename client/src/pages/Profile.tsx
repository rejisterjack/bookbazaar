
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { User, Key, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, apiKey, generateApiKey } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard",
    });
  };

  const maskedApiKey = apiKey ? `${apiKey.substring(0, 8)}${'*'.repeat(24)}` : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Profile
      </h1>

      <div className="grid gap-6">
        {/* User Information */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>User Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{user?.username}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <div>
                <Badge className={user?.isAdmin ? 'bg-purple-500' : 'bg-blue-500'}>
                  {user?.isAdmin ? 'Administrator' : 'User'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Key Management */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>API Key Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Generate an API key to access BookBazaar's API programmatically. 
              This key allows you to fetch book data and reviews.
            </p>

            {apiKey ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your API Key</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-3 bg-gray-50 rounded-lg font-mono text-sm">
                      {showApiKey ? apiKey : maskedApiKey}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Keep your API key secure and do not share it publicly</li>
                    <li>• Use this key in the X-API-Key header for API requests</li>
                    <li>• You can regenerate your key anytime if compromised</li>
                  </ul>
                </div>

                <Button
                  onClick={generateApiKey}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Regenerate API Key</span>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No API Key Generated</h3>
                <p className="text-gray-500 mb-4">
                  Generate an API key to start using the BookBazaar API
                </p>
                <Button
                  onClick={generateApiKey}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Generate API Key
                </Button>
              </div>
            )}

            {/* API Usage Examples */}
            {apiKey && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">API Usage Examples</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fetch all books</label>
                    <div className="p-3 bg-gray-900 text-green-400 rounded-lg text-sm font-mono overflow-x-auto">
                      curl -H "X-API-Key: {apiKey}" http://localhost:5000/books
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Get book details</label>
                    <div className="p-3 bg-gray-900 text-green-400 rounded-lg text-sm font-mono overflow-x-auto">
                      curl -H "X-API-Key: {apiKey}" http://localhost:5000/books/1
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
