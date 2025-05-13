// src/pages/CodingRooms/RoomsList.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetRoomsQuery, useSearchRoomsQuery } from '@/redux/features/codingRoom/codingRoomsApi';
import { CodingRoom } from '@/types/codingRoom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, X } from 'lucide-react';

const RoomsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState("public");
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: rooms = [], isLoading: isLoadingRooms } = useGetRoomsQuery(
    { public: activeTab === "public" },
    { skip: isSearching }
  );

  const { data: searchResults = [], isLoading: isSearchLoading } = useSearchRoomsQuery(
    searchTerm,
    { skip: !isSearching || !searchTerm }
  );

  const displayRooms = isSearching ? searchResults : rooms;
  const isLoading = isSearching ? isSearchLoading : isLoadingRooms;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(!!searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Coding Rooms</h1>
        <Link to="/coding-rooms/create">
          <Button>Create New Room</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Tabs
          defaultValue="public"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setSearchTerm('');
            setIsSearching(false);
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public">Public Rooms</TabsTrigger>
            <TabsTrigger value="my">My Rooms</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search rooms..."
              className="pl-8"
            />
            {isSearching && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : displayRooms.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium">
              {isSearching ? 'No rooms match your search.' : 'No rooms available.'}
            </h3>
            <p className="text-muted-foreground mt-2">
              {activeTab === "public"
                ? "Try creating a new room or searching with different terms."
                : "You haven't created or joined any rooms yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayRooms.map((room: CodingRoom) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
};

// Room card component
const RoomCard: React.FC<{ room: CodingRoom }> = ({ room }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="truncate">{room.name}</CardTitle>
        <CardDescription>
          <Badge variant="outline" className="mr-2">
            {room.language || 'JavaScript'}
          </Badge>
          {room.isPrivate ? (
            <Badge variant="secondary">Private</Badge>
          ) : (
            <Badge variant="secondary">Public</Badge>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        {room.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{room.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-2">
          {room.tags?.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between border-t">
        <span className="text-xs text-muted-foreground">
          {room.participants?.length || 0} participants
        </span>
        <Link to={`/coding-rooms/${room._id}`} className="w-full text-right">
          <Button variant="ghost" size="sm">Open Room</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RoomsList;
