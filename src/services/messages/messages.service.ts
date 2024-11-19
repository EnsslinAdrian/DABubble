import { Injectable } from '@angular/core';
import { Message } from '../../interface/message';
import { AuthenticationService } from '../authentication/authentication.service';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, updateDoc } from '@firebase/firestore';
import { MemberService } from '../member/member.service';
import { ChannelService } from '../channel/channel.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {


  // Messages
  messages: any = [];
  messagesUpdated = new Subject<void>();

  constructor(
    public authenticationService: AuthenticationService,
    private memberService: MemberService,
    private channelService: ChannelService
  ) { }

  async readChannel() {
    const docRef = doc(this.authenticationService.getReference(), "channels", this.channelService.currentChannelId);
    const channel = await getDoc(docRef);
    if (channel.exists()) {
      await this.loadInitialMessages(this.channelService.currentChannelId);
      this.listenToMessages(this.channelService.currentChannelId);
      this.authenticationService.currentChannelData = channel.data();
      this.memberService.allChannelMembers = [];
      this.memberService.allMembersInChannel();
    }
  }

  async loadInitialMessages(channelId: string) {
    const messagesCollectionRef = collection(this.authenticationService.getReference(), "channels", channelId, "messages");
    const querySnapshot = await getDocs(messagesCollectionRef);
    this.messages = querySnapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => a['timestamp'] - b['timestamp']);
    this.messagesUpdated.next();
  }

  listenToMessages(channelId: string) {
    const messagesCollectionRef = collection(this.authenticationService.getReference(), "channels", channelId, "messages");
    const unsub = onSnapshot(messagesCollectionRef, (querySnapshot) => {
      const loadedMessages = querySnapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => a['timestamp'] - b['timestamp']);
      if (loadedMessages.length > 0) {
        this.messages = loadedMessages;
        this.messagesUpdated.next();
      }
    });

    // Gib die Unsubscribe-Funktion zurück
    return unsub;
  }

  async createMessage(message: string, imagePreviews: any) {
    const now = new Date();
    const cityDocRef = doc(this.authenticationService.getReference(), "channels", this.channelService.currentChannelId);
    const messageCollectionRef = collection(cityDocRef, "messages");
    const messageDocRef = await addDoc(messageCollectionRef, {
      user: this.authenticationService.getCurrentUserUid(),
      name: this.authenticationService.currentMember.name,
      time: `${now.getHours()}:${now.getMinutes()}`,
      message: message,
      profileImage: this.authenticationService.currentMember.imageUrl,
      createdAt: now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }),
      timestamp: now.getTime(),
      reactions: {
        like: [],
        rocket: []
      },
      answers: 0,
      lastAnswer: '',
      attachment: imagePreviews.filter((item: any): item is string => typeof item === 'string')
    });
    await updateDoc(messageDocRef, {
      messageId: messageDocRef.id,
    });
    this.messagesUpdated.next();
  }

  checkUser(message: any): boolean {
    return message.user === this.authenticationService.memberId;
  }

  async deleteMessage(messageId: string) {
    const baseRef = this.authenticationService.getReference();
    const channelId = this.channelService.currentChannelId;
    const messageRef = doc(baseRef, "channels", channelId, "messages", messageId);
    await deleteDoc(messageRef);
    const messagesCollectionRef = collection(baseRef, "channels", channelId, "messages");
    const querySnapshot = await getDocs(messagesCollectionRef);
    if (querySnapshot.empty) {
      this.messages = [];
      this.messagesUpdated.next();
    }
  }

  async adminUserChannel(id: string) {
    const docRef = doc(this.authenticationService.getReference(), "member", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()['name'];
    } 
  }

  

}
