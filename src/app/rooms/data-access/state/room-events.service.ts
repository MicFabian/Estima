import { Injectable, inject, effect } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RoomsService } from './rooms.service';
import { VotingPhase } from '../../../shared/types/room.types';

export interface RoomEvent {
  type: string;
  storyId: string;
  votingPhase: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class RoomEventsService {
  private rxStompService = inject(RxStompService);
  private roomsService = inject(RoomsService);
  private eventSubscription: Subscription | null = null;

  // Event subjects
  private discussionStartedSubject = new BehaviorSubject<RoomEvent | null>(null);
  discussionStarted$ = this.discussionStartedSubject.asObservable();

  private storyDeletedSubject = new BehaviorSubject<RoomEvent | null>(null);
  storyDeleted$ = this.storyDeletedSubject.asObservable();

  private currentRoomId: string | null = null;

  constructor() {
    // Use effect() to watch for changes to the currentRoom signal
    effect(() => {
      const room = this.roomsService.currentRoom();
      if (room?.id !== this.currentRoomId) {
        this.unsubscribeFromEvents();
        
        if (room?.id) {
          this.currentRoomId = room.id;
          this.subscribeToRoomEvents(room.id);
        } else {
          this.currentRoomId = null;
        }
      }
    });
  }

  private subscribeToRoomEvents(roomId: string): void {
    console.log(`Subscribing to room events for room ${roomId}`);
    
    this.eventSubscription = this.rxStompService
      .watch(`/topic/rooms/${roomId}/events`)
      .subscribe(message => {
        const event = JSON.parse(message.body) as RoomEvent;
        console.log('Received room event:', event);
        
        this.processRoomEvent(event);
      });
  }

  private processRoomEvent(event: RoomEvent): void {
    switch (event.type) {
      case 'discussion_started':
        this.discussionStartedSubject.next(event);
        
        // Update the current story's voting phase in the room state
        const room = this.roomsService.currentRoom();
        if (room && room.currentStory && room.currentStory.id === event.storyId) {
          const updatedStory = {
            ...room.currentStory,
            votingPhase: VotingPhase.DISCUSSING,
            votingActive: false
          };
          
          const updatedRoom = {
            ...room,
            currentStory: updatedStory,
            stories: room.stories.map(story => 
              story.id === event.storyId 
                ? { ...story, votingPhase: VotingPhase.DISCUSSING, votingActive: false }
                : story
            )
          };
          
          // Update the room state
          this.roomsService.setCurrentRoom(updatedRoom);
        }
        break;
      
      case 'story_deleted':
        console.log('Story deleted event received:', event);
        this.storyDeletedSubject.next(event);
        
        // Check if the deleted story is the current story
        const currentRoom = this.roomsService.currentRoom();
        if (currentRoom && currentRoom.currentStory && currentRoom.currentStory.id === event.storyId) {
          console.log('Current story was deleted, deselecting it');
          
          // Deselect the current story
          const updatedRoom = {
            ...currentRoom,
            currentStory: null,
            stories: currentRoom.stories.filter(story => story.id !== event.storyId)
          };
          
          // Update the room state
          this.roomsService.setCurrentRoom(updatedRoom);
        }
        break;
      
      default:
        console.log('Unknown event type:', event.type);
    }
  }

  private unsubscribeFromEvents(): void {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
      this.eventSubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeFromEvents();
  }
}
