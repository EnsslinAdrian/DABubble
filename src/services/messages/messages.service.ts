import { Injectable } from '@angular/core';
import { Message } from '../../interface/message';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  userId: string = 'uidTestId';
  profileImage: string = '/img/profile-pic/003.svg';


  public message: Message[] = [
    {
      user: 'member',
      name: 'Ma Mustermann',
      time: '16:10',
      message: 'Angular ist ein Framework von Google',
      profileImage: '/img/profile-pic/001.svg',
      createdAt: 'Mittwoch, 15 Januar',
      reactions: {
        like: ['1', '2', '3'],
        rocket: []
      },
      answers: [],
      attachmen: [
        '/img/profile-pic/004.svg',
        '/img/profile-pic/004.svg',
      ]
    },
    {
      user: 'uidTestId',
      name: 'Max Mustermann',
      time: '16:10',
      message: 'Angular ist ein Framework von Google kjsdhf ',
      profileImage: '/img/profile-pic/001.svg',
      createdAt: 'Mittwoch, 15 Januar',
      reactions: {
        like: [],
        rocket: []
      },
      answers: [],
      attachmen: [
        '/img/profile-pic/004.svg',
      ]
    },

  ]

  deleteMessage(index: number) {
    this.message.splice(index, 1);
    this.message = [...this.message];
    console.log('Erfolgreich gelöscht', index)
  }

  checkUser(message: any): boolean {
    return message.user === this.userId;
  }
}
