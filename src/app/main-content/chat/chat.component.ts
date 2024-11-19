import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatHeaderComponent } from "./chat-header/chat-header.component";
import { ChatMessageFieldComponent } from "./chat-message-field/chat-message-field.component";
import { CommonModule } from '@angular/common';
import { Message } from '../../../interface/message';
import { MessageComponent } from "../message/message.component";
import { MessagesService } from '../../../services/messages/messages.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { MatIcon } from '@angular/material/icon';
import { DirectMessageService } from '../../../services/directMessage/direct-message.service';



@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    ChatHeaderComponent,
    ChatMessageFieldComponent,
    CommonModule,
    MessageComponent,
    MatIcon
],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  public message: Message[] = [];
  public currentUserId: string = 'uidTestId';
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  private shouldScroll: boolean = true;
  public isLoading: boolean = true;

  constructor(
    public object: MessagesService, 
    public auth: AuthenticationService,
    public directMessageService: DirectMessageService,
    public messageService: MessagesService
  ) {
  }

  ngOnInit() {
    this.messageService.messagesUpdated.subscribe(() => {
      this.message = [...this.messageService.messages];
      this.isLoading = false;
      this.shouldScroll = true;
    });
    this.directMessageService.messagesUpdated.subscribe(() => {
      this.isLoading = false;
      this.shouldScroll = true;
    });
  }

  onMessagesUpdated() {
    this.message = [...this.messageService.messages];
    this.shouldScroll = true;
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) { 
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  isUserDirectMessage() {
    return this.directMessageService.userOne == this.directMessageService.userTwo
  }

  checkUserAdmin(admin: string) {
    return this.auth.memberId == admin
  }

   isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
  
   formatTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("de-DE", options).format(date);
  }
  
   formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("de-DE", options).format(date);
    const [datePart, timePart] = formatter.split(", ");
    return `am ${datePart} um ${timePart}`;
  }
  
   parseTime(time: { toDate: () => Date }): string {
    const date = time.toDate();
    return this.isToday(date) ? `heute` : this.formatDate(date);
  }

}
