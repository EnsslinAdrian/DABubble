import { inject, Injectable } from '@angular/core';
import { Auth, verifyPasswordResetCode, confirmPasswordReset, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateEmail, updateProfile, sendPasswordResetEmail, updatePassword, User} from '@angular/fire/auth';
import { doc, getFirestore, setDoc } from '@angular/fire/firestore';
import { RouterModule, Router } from '@angular/router';
import { Member } from '../../interface/message';
import { getStorage } from '@angular/fire/storage';
import { onSnapshot } from '@firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { Channel } from '../../classes/channel.class';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private provider;
  public storage;
  memberId: string = '';
  oobCode:string = '';
  infoBannerIsSubmit:boolean = false;
  infoBannertext:string = '';
  infoBannerIcon:string = '';
  currentMember!: Member;
  currentChannelData: any = {};
  auth = inject(Auth);
  private currentMemberSubject = new BehaviorSubject<Member | null>(null);
  currentMember$ = this.currentMemberSubject.asObservable();
  loginFailed = false;

  constructor(
    private router: Router,
  ) {
    this.provider = new GoogleAuthProvider();
    this.storage = getStorage();
    this.observerUser();
  }
  // Authentication 
  

  enableInfoBanner(text:string, icon:string = '', time:number = 3000,){
    this.infoBannerIcon = icon;
    this.infoBannertext = text;
    this.infoBannerIsSubmit = true;
    setTimeout(() => {
      this.infoBannerIsSubmit = false;
    }, 1750)
  }

  signInUser(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        this.loginFailed = false;
        this.enableInfoBanner('Sign-In Succesfully');
      }).then(() => {        
        setTimeout(() => {
        this.router.navigate(['start'])
      }, 1750);
    })
      .catch((error) => {
        this.loginFailed = true;
      });
  }

  initializeCurrentMember(): void {
    const userId = this.getCurrentUserUid();
    if (!userId) {
      console.error('Kein Benutzer angemeldet');
      return;
    };
    const docRef = doc(this.getReference(), 'member', userId);
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const member: Member = {
          id: data['id'],
          name: data['name'],
          email: data['email'],
          imageUrl: data['imageUrl'],
          status: data['status'],
          channelIds: data['channelIds'] || [],
          ignoreList: data['ignoreList'] || [],
        };
        this.currentMemberSubject.next(member);
      } else {
        console.log('Mitgliedsdaten nicht gefunden!');
        this.currentMemberSubject.next(null);
      }
    });
  }


  observerUser(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.memberId = user.uid;
        const memberDoc = doc(this.getReference(), 'member', user.uid);
        onSnapshot(
          memberDoc,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const member: Member = {
                id: data['id'] || user.uid,
                name: data['name'] || user.displayName || 'Unbekannt',
                email: data['email'] || user.email || 'Keine E-Mail',
                imageUrl: data['imageUrl'] || user.photoURL || '',
                status: true,
                channelIds: data['channelIds'] || [],
                ignoreList: data['ignoreList'] || [],
              };
              // console.log("Aktualisierte Member-Daten:", member);
              this.currentMemberSubject.next(member);
            } 
          } 
        ); 
      } 
    });
  }
  
  async updateAuthProfileData(currentMember: Member): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (user) {
        await updateEmail(user, currentMember.email);
        await updateProfile(user, {
          displayName: currentMember.name,
        });
      } else {
        console.error("No authentified user found.");
      }
    } catch (error) {
      console.error("Error while updating the data in firebase-authentication:", error);
    }
  }

  signOutUser() {
    signOut(this.auth).then(() => {
      this.router.navigate(['login']);
    }).catch((error) => {
      console.log('log out error:', error)
    });
  }

  getCurrentUserId(): string | null {
    const currentUser = this.auth.currentUser;
    return currentUser ? currentUser.uid : null;
  }

  getCurrentUserUid(): string {
    const uid = this.getCurrentUserId();
    if (!uid) {
      this.router.navigate(['login']);
      throw new Error("Kein Benutzer angemeldet.");
    };
    return uid;
  }

  getReference() {
    return getFirestore();
  }  
  
  // Lost Password
  async resetPassword(email:string){
    sendPasswordResetEmail(this.auth, email)
    .then(() => {
    })
    .catch((error) => {
      console.error(error);
    });
  }

  async saveNewPassword(newPassword:string = 'Test-Example-003'){
    const email = await verifyPasswordResetCode(this.auth, this.oobCode);
    await confirmPasswordReset(this.auth, this.oobCode, newPassword);
    this.oobCode = '';
  }

}
