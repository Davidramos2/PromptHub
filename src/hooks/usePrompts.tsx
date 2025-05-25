
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Local storage fallback for guests - now compatible with Prompt interface
interface LocalPrompt {
  id: string;
  user_id: string; // Will be 'guest' for local storage
  title: string;
  description: string | null;
  content: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Local storage fallback for guests
const LOCAL_STORAGE_KEY = "promptup-prompts";

export function usePrompts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localPrompts, setLocalPrompts] = useState<LocalPrompt[]>([]);

  // Load local prompts for guests
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setLocalPrompts(JSON.parse(saved));
      }
    }
  }, [user]);

  // Save local prompts for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localPrompts));
    }
  }, [localPrompts, user]);

  // Query user's prompts from Supabase
  const { data: userPrompts = [], isLoading: userPromptsLoading } = useQuery({
    queryKey: ['user-prompts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Prompt[];
    },
    enabled: !!user,
  });

  // Query public prompts from Supabase
  const { data: publicPrompts = [], isLoading: publicPromptsLoading } = useQuery({
    queryKey: ['public-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Prompt[];
    },
  });

  // Create prompt mutation
  const createPromptMutation = useMutation({
    mutationFn: async (promptData: { title: string; description: string; content: string; is_public?: boolean }) => {
      if (user) {
        // Save to Supabase
        const { data, error } = await supabase
          .from('prompts')
          .insert({
            user_id: user.id,
            title: promptData.title,
            description: promptData.description,
            content: promptData.content,
            is_public: promptData.is_public || false,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Save to local storage with compatible structure
        const now = new Date().toISOString();
        const newPrompt: LocalPrompt = {
          id: Date.now().toString(),
          user_id: 'guest',
          title: promptData.title,
          description: promptData.description,
          content: promptData.content,
          is_public: promptData.is_public || false,
          created_at: now,
          updated_at: now,
        };
        setLocalPrompts(prev => [newPrompt, ...prev]);
        return newPrompt;
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['user-prompts'] });
        queryClient.invalidateQueries({ queryKey: ['public-prompts'] });
      }
      toast({
        title: "Success",
        description: "Prompt created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create prompt. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating prompt:', error);
    },
  });

  // Update prompt mutation
  const updatePromptMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Prompt> }) => {
      if (user) {
        // Update in Supabase
        const { data, error } = await supabase
          .from('prompts')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Update in local storage
        const now = new Date().toISOString();
        const updatedPrompt = { ...updates, updated_at: now };
        setLocalPrompts(prev => 
          prev.map(prompt => 
            prompt.id === id ? { ...prompt, ...updatedPrompt } : prompt
          )
        );
        return { id, ...updatedPrompt };
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['user-prompts'] });
        queryClient.invalidateQueries({ queryKey: ['public-prompts'] });
      }
      toast({
        title: "Success",
        description: "Prompt updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update prompt. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating prompt:', error);
    },
  });

  // Delete prompt mutation
  const deletePromptMutation = useMutation({
    mutationFn: async (id: string) => {
      if (user) {
        // Delete from Supabase
        const { error } = await supabase
          .from('prompts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Delete from local storage
        setLocalPrompts(prev => prev.filter(prompt => prompt.id !== id));
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['user-prompts'] });
        queryClient.invalidateQueries({ queryKey: ['public-prompts'] });
      }
      toast({
        title: "Success",
        description: "Prompt deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete prompt. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting prompt:', error);
    },
  });

  // Duplicate prompt mutation (for community prompts)
  const duplicatePromptMutation = useMutation({
    mutationFn: async (originalPrompt: Prompt) => {
      const duplicatedData = {
        title: `${originalPrompt.title} (Copy)`,
        description: originalPrompt.description || '',
        content: originalPrompt.content,
        is_public: false,
      };
      
      return createPromptMutation.mutateAsync(duplicatedData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prompt duplicated to your collection!",
      });
    },
  });

  // Cast local prompts to Prompt type for compatibility
  const userPromptsFormatted: Prompt[] = user ? userPrompts : localPrompts as Prompt[];

  return {
    userPrompts: userPromptsFormatted,
    publicPrompts,
    isLoading: userPromptsLoading || publicPromptsLoading,
    createPrompt: createPromptMutation.mutate,
    updatePrompt: updatePromptMutation.mutate,
    deletePrompt: deletePromptMutation.mutate,
    duplicatePrompt: duplicatePromptMutation.mutate,
    isCreating: createPromptMutation.isPending,
    isUpdating: updatePromptMutation.isPending,
    isDeleting: deletePromptMutation.isPending,
    isDuplicating: duplicatePromptMutation.isPending,
  };
}
