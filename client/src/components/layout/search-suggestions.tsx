import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface SearchSuggestionsProps {
  query: string;
  onClose: () => void;
  onSelect: (productId: string) => void;
}

interface Suggestion {
  id: string;
  name: string;
  thumbUrl: string;
}

export function SearchSuggestions({ query, onClose, onSelect }: SearchSuggestionsProps) {
  const { data: suggestions, isLoading } = useQuery<Suggestion[]>({
    queryKey: ["/api/products/suggest", query],
    enabled: query.length > 0,
  });

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-popover-border rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Recherche...</span>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-popover-border rounded-lg shadow-lg p-4 z-50">
        <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-popover-border rounded-lg shadow-lg overflow-hidden z-50">
      <div className="max-h-96 overflow-y-auto">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion.id)}
            className="w-full flex items-center gap-3 p-3 hover-elevate active-elevate-2 border-b border-border last:border-0"
            data-testid={`suggestion-${suggestion.id}`}
          >
            <img
              src={suggestion.thumbUrl}
              alt={suggestion.name}
              className="w-12 h-12 object-cover rounded-md"
            />
            <span className="text-sm text-foreground text-left flex-1">{suggestion.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
