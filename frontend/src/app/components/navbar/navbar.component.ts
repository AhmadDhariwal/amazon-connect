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

       incomingContact: any = null;
       agentObj: any = null;



  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {



  connect.core.initCCP(this.ccpContainer.nativeElement, {
    ccpUrl: "https://ccs123.my.connect.aws/ccp-v2/",
    loginPopup: true,
    softphone: { allowFramedSoftphone: true }
  });

   setTimeout(() => {
    this.registerAgent();
    this.listenForIncomingCalls();
  }, 2000);



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

 // const agent = new connect.Agent();
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
    'Busy': 'Busy',

  };

  const mappedStateName = stateMapping[stateName] || stateName;

    const state = this.agentObj.getAgentStates()
      .find((s: any) => s.name === mappedStateName || s.type === mappedStateName);

    if (state) {
      this.agentObj.setState(state, {
        success: () => console.log('Agent state updated:', stateName),
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

  // listenForIncomingCalls() {
  // console.log('🎧 Setting up call listeners...');

  // connect.contact((contact: any) => {
  //   console.log('📞 New contact detected!');
  //   console.log('Contact ID:', contact.getContactId());
  //   console.log('Contact Type:', contact.getType());
  //   console.log('Contact State:', contact.getState());

  //   // Log ALL contact types to see what's coming through
  //   console.log('Is Voice?', contact.getType() === connect.ContactType.VOICE);
  //   console.log('ContactType.VOICE constant:', connect.ContactType.VOICE);

  //   if (contact.getType() !== connect.ContactType.VOICE) {
  //     console.log('❌ Ignoring non-voice contact');
  //     return;
  //   }

  //   console.log('✅ Voice contact - setting up listeners');

  //   contact.onIncoming(() => {
  //     console.log('🔔 INCOMING CALL EVENT FIRED!');
  //     console.log('Setting callState to Ringing');
  //     this.callState = 'Ringing';
  //     this.incomingContact = contact;

  //     // Force Angular change detection
  //     setTimeout(() => {
  //       console.log('Current callState:', this.callState);
  //       console.log('Has incomingContact:', !!this.incomingContact);
  //     }, 100);
  //   });

  //   contact.onConnecting(() => {
  //     console.log('📱 Call connecting...');
  //     this.callState = 'Connecting';
  //   });

  //   contact.onConnected(() => {
  //     console.log('✅ Call connected!');
  //     this.callState = 'Connected';
  //   });

  //   contact.onEnded(() => {
  //     console.log('📴 Call ended');
  //     this.callState = '';
  //     this.incomingContact = null;
  //   });

  //   // Add more event listeners to catch everything
  //   contact.onRefresh(() => {
  //     console.log('🔄 Contact refreshed');
  //   });

  //   contact.onDestroy(() => {
  //     console.log('💥 Contact destroyed');
  //   });
  // });
//}

// listenForIncomingCalls() {
//   console.log(' Setting up call listeners...');

//   connect.contact((contact: any) => {
//     console.log(' New contact detected!');
//     console.log('Contact ID:', contact.getContactId());
//     console.log('Contact Type:', contact.getType());
//     console.log('Contact State:', contact.getState());

//     if (contact.getType() !== connect.ContactType.VOICE) {
//       console.log(' Ignoring non-voice contact');
//       return;
//     }

//     console.log('Voice contact - setting up listeners');

//     contact.onIncoming(() => {
//       try {
//         console.log('INCOMING CALL EVENT FIRED!');
//         console.log('Contact IDD:', contact.getContactId());

//         // Use NgZone for reliable UI updates
//         this.ngZone.run(() => {
//           this.callState = 'Ringing';
//           this.incomingContact = contact;
//         });
//       } catch (error) {
//         console.error('Error in onIncoming:', error);
//       }
//     });

//     contact.onConnected(() => {
//       console.log('Call connected!');
//       this.ngZone.run(() => {
//         this.callState = 'Connected';
//       });
//     });

//     contact.onEnded(() => {
//       console.log(' Call ended');
//       this.ngZone.run(() => {
//         this.callState = '';
//         this.incomingContact = null;
//       });
//     });
//   });
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
    });

    contact.onConnected(() => {
      console.log(' Media connected');
    });

    contact.onEnded(() => {
      console.log(' Call ended');
      this.callState = '';
      this.incomingContact = null;
    });
  });
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

    if (!this.incomingContact) return;
  this.incomingContact.reject();
    // this.incomingContact?.reject();
    // this.callState = '';
    // this.incomingContact = null;
  }

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

    if (!this.agentObj) {
    console.error('Agent not initialized');
    return;
  }

  if (!this.dialedNumber) {
    console.error('No number to dial');
    return;
  }

  console.log('Attempting to call:', this.dialedNumber);

  const endpoint = connect.Endpoint.byPhoneNumber(this.dialedNumber);
  this.agentObj.connect(endpoint, {
    success: () => {
      console.log('Call initiated successfully to:', this.dialedNumber);
      this.showDialPad = false;
    },
     failure: (err: any) => {
      console.error('Call failed:', err);
      alert('Call failed: ' + (err.message || 'Unknown error'));
    }
  });

  this.clearNumber();
    // if (!this.agentObj || !this.dialedNumber) return;

    // const endpoint = connect.Endpoint.byPhoneNumber(this.dialedNumber);
    // this.agentObj.connect(endpoint, {
    //   success: () => console.log('Calling', this.dialedNumber),
    //   failure: (err: any) => console.error('Call failed', err)
    // });

    // this.clearNumber();
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
