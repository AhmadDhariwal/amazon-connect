import { Component, OnInit, ElementRef, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import 'amazon-connect-streams';

declare const connect: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  @ViewChild('ccpContainer', { static: true }) ccpContainer!: ElementRef;
  //incomingContact: any = null; // current incoming contact


         title = signal("Amazon Connect");
         agentStatus = 'Available';
         callState = '';
         showDialPad = false;
         dialedNumber = '';

       incomingContact: any = null;
       agentObj: any = null;



  constructor(private router: Router) {}

  ngOnInit(): void {


    // Optional: subscribe to terminated event
    if (typeof connect !== 'undefined' && connect.core) {
      const eventBus = connect.core.getEventBus();
      eventBus.subscribe(connect.EventType.TERMINATED, () => {
        console.log('Amazon Connect logged out');
      });
    }
  }
    handleLogoutButtonClick() : void  {
  const agent = new connect.Agent();
  if (agent.getState().type === connect.AgentStatusType.OFFLINE) {
    this.onLogout();
  } else {
    this.setAgentOffline()
      .then(this.onLogout)
      .catch(console.error);
  }
}

setAgentOffline() : any {
  return new Promise((resolve, reject) => {
    const agent = new connect.Agent();
    const offlineState = agent.getAgentStates()[0];
    // .find(
    //   (state : any ) => state.type === connect.AgentStateType.OFFLINE,
    // );
    agent.setState(offlineState, {
      success: () => resolve,
      failure: reject,
    }, { enqueueNextState: true });
  });
}

onLogout() : void {
  const logoutEndpoint = "https://ccs123.my.connect.aws/logout";
  fetch(logoutEndpoint, { credentials: 'include', mode: 'no-cors'})
    .then(() => {

      connect.core.getEventBus().trigger(connect.EventType.TERMINATE);
         connect.core.terminate();
      this.router.navigate(['/']);
    });
}

registerAgent() {
    connect.agent((agent: any) => {
      this.agentObj = agent;
      this.agentStatus = agent.getState().name;

      agent.onStateChange((state: any) => {
        this.agentStatus = state.name;
      });
    });
  }

  // ---------------- AGENT STATUS CHANGE ----------------
  updateStatus(stateName: string) {
    if (!this.agentObj) return;

    const state = this.agentObj.getAgentStates()
      .find((s: any) => s.name === stateName);

    if (state) {
      this.agentObj.setState(state, {
        success: () => console.log('Agent state updated:', stateName),
        failure: (err: any) => console.error('State change failed', err)
      });
    }
  }

  // ---------------- INCOMING CALL LISTENER ----------------
  listenForIncomingCalls() {
    connect.contact((contact: any) => {
      if (contact.getType() === connect.ContactType.VOICE) {
        this.callState = 'Ringing';
        this.incomingContact = contact;
      }

      contact.onEnded(() => {
        this.callState = '';
        this.incomingContact = null;
      });
    });
  }

  // ---------------- ACCEPT / REJECT CALL ----------------
  acceptCall() {
    this.incomingContact?.accept();
    this.callState = '';
  }

  rejectCall() {
    this.incomingContact?.reject();
    this.callState = '';
    this.incomingContact = null;
  }

  // ---------------- DIAL PAD ----------------
  toggleDialPad() {
    this.showDialPad = !this.showDialPad;
  }

  dial(num: string) {
    this.dialedNumber += num;
  }

  clearNumber() {
    this.dialedNumber = '';
  }

  makeCall() {
    if (!this.agentObj || !this.dialedNumber) return;

    const endpoint = connect.Endpoint.byPhoneNumber(this.dialedNumber);
    this.agentObj.connect(endpoint, {
      success: () => console.log('Calling', this.dialedNumber),
      failure: (err: any) => console.error('Call failed', err)
    });

    this.clearNumber();
  }
//  listenForIncomingCalls(): void {
//     if (typeof connect === 'undefined') {
//       console.warn("Connect not loaded");
//       return;
//     }

//     connect.contact((contact: any) => {
//       // Only handle voice calls
//       if (contact.getType() === connect.ContactType.VOICE) {
//         console.log("Incoming call detected:", contact.getContactId());
//         this.incomingContact = contact; // store contact for UI
//       }
//     });
//   }

//   // Accept the incoming call
//   acceptCall(): void {
//     if (!this.incomingContact) return;

//     this.incomingContact.accept(() => {
//       console.log("Call accepted:", this.incomingContact.getContactId());
//       this.incomingContact = null; // reset after accept
//     });
//   }

//   // Reject the incoming call
//   rejectCall(): void {
//     if (!this.incomingContact) return;

//     this.incomingContact.reject(() => {
//       console.log("Call rejected:", this.incomingContact.getContactId());
//       this.incomingContact = null; // reset after reject
//     });
//   }
}
