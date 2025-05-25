
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Search, Plus, Lightbulb, Edit3, ArrowLeft, Copy, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/hooks/useAuth";
import { usePrompts, Prompt } from "@/hooks/usePrompts";

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    userPrompts, 
    publicPrompts, 
    createPrompt, 
    updatePrompt, 
    deletePrompt, 
    duplicatePrompt,
    isCreating,
    isUpdating 
  } = usePrompts();

  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [promptTitle, setPromptTitle] = useState("");
  const [promptDescription, setPromptDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"my" | "community">("my");
  const [isEditing, setIsEditing] = useState(false);

  const handleNext = () => {
    if (currentPrompt.trim()) {
      setShowDetailsForm(true);
    }
  };

  const handleSavePrompt = () => {
    if (promptTitle.trim() && promptDescription.trim()) {
      if (isEditing && selectedPrompt) {
        updatePrompt({
          id: selectedPrompt.id,
          updates: {
            title: promptTitle,
            description: promptDescription,
            content: currentPrompt,
            is_public: isPublic,
          }
        });
        setIsEditing(false);
        setSelectedPrompt(null);
      } else {
        createPrompt({
          title: promptTitle,
          description: promptDescription,
          content: currentPrompt,
          is_public: isPublic,
        });
      }
      
      // Reset form
      setCurrentPrompt("");
      setPromptTitle("");
      setPromptDescription("");
      setIsPublic(false);
      setShowDetailsForm(false);
    }
  };

  const filteredUserPrompts = userPrompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPublicPrompts = publicPrompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewPrompt = () => {
    setSelectedPrompt(null);
    setShowDetailsForm(false);
    setCurrentPrompt("");
    setPromptTitle("");
    setPromptDescription("");
    setIsPublic(false);
    setIsEditing(false);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setCurrentPrompt(prompt.content);
    setPromptTitle(prompt.title);
    setPromptDescription(prompt.description || "");
    setIsPublic(prompt.is_public);
    setIsEditing(true);
    setShowDetailsForm(true);
  };

  const canEdit = (prompt: Prompt) => {
    return user && prompt.user_id === user.id;
  };

  const handleDuplicate = (prompt: Prompt) => {
    duplicatePrompt(prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                PromptUP
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleNewPrompt}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Prompt
              </Button>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={activeTab === "my" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("my")}
                    className={activeTab === "my" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : ""}
                  >
                    My Prompts
                  </Button>
                  <Button
                    variant={activeTab === "community" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("community")}
                    className={activeTab === "community" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : ""}
                  >
                    Community
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {activeTab === "my" ? (
                  filteredUserPrompts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {userPrompts.length === 0 ? (user ? "No prompts yet" : "Sign in to sync your prompts") : "No matching prompts"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredUserPrompts.map((prompt) => (
                        <div
                          key={prompt.id}
                          onClick={() => setSelectedPrompt(prompt)}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedPrompt?.id === prompt.id
                              ? "bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{prompt.title}</h4>
                              <p className="text-xs text-gray-500 truncate">{prompt.description}</p>
                              {prompt.is_public && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mt-1">
                                  Public
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  filteredPublicPrompts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {publicPrompts.length === 0 ? "No public prompts yet" : "No matching prompts"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredPublicPrompts.map((prompt) => (
                        <div
                          key={prompt.id}
                          onClick={() => setSelectedPrompt(prompt)}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedPrompt?.id === prompt.id
                              ? "bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <h4 className="font-medium text-sm truncate">{prompt.title}</h4>
                          <p className="text-xs text-gray-500 truncate">{prompt.description}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-1">
                            Community
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedPrompt ? (
              /* Prompt Viewer */
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedPrompt.title}</CardTitle>
                      <CardDescription className="mt-2">{selectedPrompt.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {canEdit(selectedPrompt) ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPrompt(selectedPrompt)}
                            className="border-purple-200 hover:bg-purple-50"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePrompt(selectedPrompt.id)}
                            className="border-red-200 hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      ) : (
                        user && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicate(selectedPrompt)}
                            className="border-blue-200 hover:bg-blue-50"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </Button>
                        )
                      )}
                      <Button
                        variant="outline"
                        onClick={handleNewPrompt}
                        className="border-purple-200 hover:bg-purple-50"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Label className="text-sm font-medium text-gray-700">Prompt Content:</Label>
                    <div className="mt-2 whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {selectedPrompt.content}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-500">
                      Created: {new Date(selectedPrompt.created_at).toLocaleDateString()}
                    </p>
                    {selectedPrompt.is_public && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Public Prompt
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : showDetailsForm ? (
              /* Prompt Details Form */
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    {isEditing ? "Edit Prompt Details" : "Add Prompt Details"}
                  </CardTitle>
                  <CardDescription>
                    {isEditing ? "Update your prompt details." : "Give your prompt a name and description to save it to your collection."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Preview:</Label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 max-h-32 overflow-y-auto">
                      {currentPrompt}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="prompt-title">Prompt Title</Label>
                    <Input
                      id="prompt-title"
                      placeholder="e.g., Marketing Copy Generator"
                      value={promptTitle}
                      onChange={(e) => setPromptTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="prompt-description">Prompt Description</Label>
                    <Textarea
                      id="prompt-description"
                      placeholder="Describe what this prompt does and when to use it..."
                      value={promptDescription}
                      onChange={(e) => setPromptDescription(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  {user && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-public"
                        checked={isPublic}
                        onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                      />
                      <Label htmlFor="is-public" className="text-sm font-medium">
                        Make this prompt public (share with community)
                      </Label>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSavePrompt}
                      disabled={!promptTitle.trim() || !promptDescription.trim() || isCreating || isUpdating}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      {isCreating || isUpdating ? "Saving..." : (isEditing ? "Update Prompt" : "Save Prompt")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDetailsForm(false);
                        if (isEditing) {
                          setIsEditing(false);
                          setSelectedPrompt(null);
                        }
                      }}
                    >
                      Back to Editor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Prompt Creator */
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Prompt
                  </CardTitle>
                  <CardDescription>
                    Write your AI prompt below and click "Next" to add details and save it.
                    {!user && (
                      <span className="block mt-2 text-amber-600">
                        💡 Sign in with Google to sync your prompts across devices and share with the community!
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Write your AI prompt here... 

For example:
'You are a helpful marketing assistant. Create compelling social media copy for a [product type] targeting [audience]. The tone should be [tone] and include a clear call-to-action.'"
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleNext}
                      disabled={!currentPrompt.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
