import { Component, OnInit, ElementRef, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgZone } from '@angular/core';
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
         currentContact: any = null;

       incomingContact: any = null;
       agentObj: any = null;



  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {



  connect.core.initCCP(this.ccpContainer.nativeElement, {
    ccpUrl: "https://ccs123.my.connect.aws/ccp-v2/",
    loginPopup: false,
    // loginPopupAutoClose: true,
    softphone: {
      allowFramedSoftphone: true,
     disableRingtone: false
    }
  });

   setTimeout(() => {
    this.registerAgent();
    this.listenForIncomingCalls();
  }, 2000);
//   connect.core.onInitialized(() => {
//   console.log("CCP fully initialized");
//   this.registerAgent();
//   this.listenForIncomingCalls();
// });




    // Optional: subscribe to terminated event
    if (typeof connect !== 'undefined' && connect.core) {
      const eventBus = connect.core.getEventBus();
      eventBus.subscribe(connect.EventType.TERMINATED, () => {
        console.log('Amazon Connect logged out');
      });
    }
  }

    handleLogoutButtonClick() : void  {
        if (!this.agentObj) return;

  const agent = new connect.Agent();
  if (this.agentObj.getState().type !== connect.AgentStatusType.OFFLINE) {
    this.onLogout();
  } else {
    this.setAgentOffline()
      .then(this.onLogout)
      .catch(console.error);
  }
}

// setAgentOffline() : any {
  setAgentOffline(): Promise<boolean> {
  return new Promise((resolve, reject) => {

    const offline = this.agentObj.getAgentStates()
      .find((s: any) => s.type === connect.AgentStateType.OFFLINE);

    this.agentObj.setState(offline, {
      success: () => resolve(true),
      failure: reject
    });
  });
}

  // return new Promise((resolve, reject) => {
  //   const agent = new connect.Agent();
  //   const offlineState = agent.getAgentStates()[0];
  //   // .find(
  //   //   (state : any ) => state.type === connect.AgentStateType.OFFLINE,
  //   // );
  //   agent.setState(offlineState, {
  //     success: () => resolve,
  //     failure: reject,
  //   }, { enqueueNextState: true });
  // });


onLogout() : void {

  fetch("https://ccs123.my.connect.aws/logout", {
    credentials: 'include',
    mode: 'no-cors'
  }).then(() => {
    connect.core.terminate();
    this.router.navigate(['/']);
})
}

  // const logoutEndpoint = "https://ccs123.my.connect.aws/logout";
  // fetch(logoutEndpoint, { credentials: 'include', mode: 'no-cors'})
  //   .then(() => {

  //     connect.core.getEventBus().trigger(connect.EventType.TERMINATE);
  //        connect.core.terminate();
  //     this.router.navigate(['/']);
  //   });
//}


testAgentStatus() {
  if (this.agentObj) {
    console.log('Agent Status:', this.agentObj.getState());
    console.log('Agent States Available:', this.agentObj.getAgentStates());
    console.log('Agent Configuration:', this.agentObj.getConfiguration());
  } else {
    console.log('Agent not initialized yet');
  }
}


registerAgent() {
    connect.agent((agent: any) => {
      this.agentObj = agent;
      this.agentStatus = agent.getState().name;
      console.log('Agent registered successfully');


       const initialState = agent.getState();
    console.log('Initial agent state:', initialState);
    this.agentStatus = initialState.name;

      agent.onStateChange((state: any) => {
              console.log('Agent state changed to:',  agent.getState().name,'Type:' ,  agent.getState().type);
        this.agentStatus =  agent.getState().name;


       if (this.agentStatus !== agent.getState().name) {
        this.agentStatus = agent.getState().name;
      }
       });
  });
}

  updateStatus(stateName: string) {
    if (!this.agentObj){
        console.error('Agent not initialized');
        return;
    }
      const stateMapping: { [key: string]: string } = {
    'Available': 'Available',
    'Busy': 'Offline',

  };

  const mappedStateName = stateMapping[stateName] ;

    const state = this.agentObj.getAgentStates()
      .find((s: any) => s.name === mappedStateName || s.type === mappedStateName);

    if (state) {
      this.agentObj.setState(state, {
        success: () => console.log('Agent state updated:', mappedStateName),
        failure: (err: any) => console.error('State change failed', err)
      });
    }
     else {
    console.error('State not found:', mappedStateName);
  }
  }


//   updateStatus(statename: string) {
//   if (!this.agentObj) {
//     console.error('Agent not initialized');
//     return;
//   }

//   const stateMap: { [key: string]: string } = {
//     'Available': 'Available',
//     'Busy': 'Offline'
//   };

//   const targetAmazonState = stateMap[statename];
//   if (!targetAmazonState) {
//     console.error('Unknown state:', statename);
//     return;
//   }

//   const amazonState = this.agentObj.getAgentStates()
//     .find((s: any) => s.name === targetAmazonState);

//   if (!amazonState) {
//     console.error('Amazon state not found:', targetAmazonState);
//     return;
//   }

//   this.agentObj.setState(amazonState, {
//     success: () => console.log(`Agent state set to ${statename} (${targetAmazonState})`),
//     failure: () => console.error('State change failed')
//   });
// }


  // listenForIncomingCalls() {
  //   connect.contact((contact: any) => {
  //     if (contact.getType() !== connect.ContactType.VOICE) return;

  //     contact.onIncoming(() => {
  //       console.log('Incoming contact:');
  //       this.callState = 'Ringing';
  //       this.incomingContact = contact;
  //     });

  //     contact.onEnded(() => {
  //       this.callState = '';
  //       this.incomingContact = null;
  //     });
  //   });
  // }

// get showIncomingControls() {
//   return this.callState === 'Ringing' && this.incomingContact;
// }

listenForIncomingCalls() {
  connect.contact((contact: any) => {

    if (contact.getType() !== connect.ContactType.VOICE) return;


    contact.onConnecting(() => {
      console.log('Incoming call...');
      this.callState = 'Ringing';
      this.incomingContact = contact;
    });

    contact.onAccepted(() => {
      console.log('Call accepted');
      this.callState = 'Connected';
       this.currentContact = contact;
    });

    contact.onConnected(() => {
      console.log(' Media connected');
      this.currentContact = contact;
    });

    contact.onEnded(() => {
      console.log(' Call ended');
      this.callState = '';
      this.incomingContact = null;
      this.currentContact = null;
    });
  });
}


endCall(): void {
  if (!this.currentContact) return;
  this.currentContact.getAgentConnection().destroy();
  console.log('Call ended by agent');
}

  acceptCall() : void {
    console.log("Call accepted")
     if (!this.incomingContact) return;
  this.incomingContact.accept();
    // this.incomingContact?.accept();
    // this.callState = '';
  }

  rejectCall() : void {
        console.log("Call Rejected")

    // if (!this.incomingContact) return;
    //  this.incomingContact.getAgentConnection().destroy();
  console.log('Call ended by agent');
   this.incomingContact.reject();
    // this.incomingContact?.reject();
    // this.callState = '';
    // this.incomingContact = null;
  }

  toggleDialPad() {
    this.showDialPad = !this.showDialPad;
  }


  sendDTMF(digit: string): void {
  if (!this.currentContact) {
    console.error('No active call to send DTMF');
    return;
  }

  this.currentContact.sendDigits(digit, {
    success: () => console.log('DTMF sent:', digit),
    failure: (err: any) => console.error('DTMF failed:', err)
  });
}

  dial(num: string) {
    if (this.callState === 'Connected' && this.currentContact) {
    this.sendDTMF(num);
  } else {
    this.dialedNumber += num;
  }
}

  clearNumber() {
    this.dialedNumber = '';
  }
  onPaste(event: ClipboardEvent) {
  const pastedText = event.clipboardData?.getData('text') || '';
  const filteredText = pastedText.replace(/[^0-9+#]/g, '');
  this.dialedNumber = (this.dialedNumber || '') + filteredText;
  event.preventDefault();
}


  backspace(){
    this.dialedNumber = this.dialedNumber.slice(0,-1);
    console.log("backspace clicked");
  }
  makeCall() {

    if (!this.agentObj) {
    console.error('Agent not initialized');
    return;
  }

  if (!this.dialedNumber) {
    console.error('No number to dial');
    return;
  }
   if (this.agentObj.getState().name !== 'Available') {
    alert('Set status to Available before calling');
    return;
  }

  console.log('Attempting to call:', this.dialedNumber);

  const endpoint = connect.Endpoint.byPhoneNumber(this.dialedNumber);
  var agent = new connect.Agent();
  var queueArn = "arn:aws:connect:eu-west-2:547576598746:instance/e5becbb8-c2f7-40c8-aec4-d40f0e6ff035/queue/e33104db-9590-4de1-b604-fe91987715b4";

  this.agentObj.connect(endpoint, {
      queueARN: queueArn,
    success: () => {
      console.log('Call initiated successfully to:', this.dialedNumber);
      this.showDialPad = false;
      this.clearNumber();

    },
     failure: (err: any) => {
      console.error('Call failed:', err);
      alert('Call failed: ' + (err.message || 'Unknown error'));
    }
  });

  }
}
