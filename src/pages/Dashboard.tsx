
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, Search, Plus, Lightbulb, Edit3, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Prompt {
  id: string;
  content: string;
  name: string;
  description: string;
  createdAt: string;
}

const Dashboard = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [promptName, setPromptName] = useState("");
  const [promptDescription, setPromptDescription] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load prompts from localStorage on component mount
  useEffect(() => {
    const savedPrompts = localStorage.getItem("ai-ideias-prompts");
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    }
  }, []);

  // Save prompts to localStorage whenever prompts change
  useEffect(() => {
    localStorage.setItem("ai-ideias-prompts", JSON.stringify(prompts));
  }, [prompts]);

  const handleNext = () => {
    if (currentPrompt.trim()) {
      setShowDetailsForm(true);
    }
  };

  const handleSavePrompt = () => {
    if (promptName.trim() && promptDescription.trim()) {
      const newPrompt: Prompt = {
        id: Date.now().toString(),
        content: currentPrompt,
        name: promptName,
        description: promptDescription,
        createdAt: new Date().toISOString(),
      };
      
      setPrompts(prev => [newPrompt, ...prev]);
      
      // Reset form
      setCurrentPrompt("");
      setPromptName("");
      setPromptDescription("");
      setShowDetailsForm(false);
    }
  };

  const filteredPrompts = prompts.filter(prompt =>
    prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewPrompt = () => {
    setSelectedPrompt(null);
    setShowDetailsForm(false);
    setCurrentPrompt("");
    setPromptName("");
    setPromptDescription("");
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
                AI Ideias
              </h1>
            </Link>
            <Button
              onClick={handleNewPrompt}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Prompt
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  My Prompts
                </CardTitle>
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
                {filteredPrompts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {prompts.length === 0 ? "No prompts yet" : "No matching prompts"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        onClick={() => setSelectedPrompt(prompt)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedPrompt?.id === prompt.id
                            ? "bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <h4 className="font-medium text-sm truncate">{prompt.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{prompt.description}</p>
                      </div>
                    ))}
                  </div>
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
                      <CardTitle className="text-2xl">{selectedPrompt.name}</CardTitle>
                      <CardDescription className="mt-2">{selectedPrompt.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleNewPrompt}
                      className="border-purple-200 hover:bg-purple-50"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Label className="text-sm font-medium text-gray-700">Prompt Content:</Label>
                    <div className="mt-2 whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {selectedPrompt.content}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Created: {new Date(selectedPrompt.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ) : showDetailsForm ? (
              /* Prompt Details Form */
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Add Prompt Details
                  </CardTitle>
                  <CardDescription>
                    Give your prompt a name and description to save it to your collection.
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
                    <Label htmlFor="prompt-name">Prompt Name</Label>
                    <Input
                      id="prompt-name"
                      placeholder="e.g., Marketing Copy Generator"
                      value={promptName}
                      onChange={(e) => setPromptName(e.target.value)}
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
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSavePrompt}
                      disabled={!promptName.trim() || !promptDescription.trim()}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Save Prompt
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailsForm(false)}
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
