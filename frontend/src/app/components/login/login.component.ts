import { Component } from '@angular/core';
import { RouterLink ,Router,ActivatedRoute} from '@angular/router';
import "amazon-connect-streams";
import { NavbarComponent } from '../navbar/navbar.component';
declare const connect: any;


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink,NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

     constructor(
       private router: Router,
      private route : ActivatedRoute
    ){ }


       init() : void {
              var containerDiv = document.getElementById("ccp-container");
              if (!containerDiv) return;
          const instanceURL = 'https://ccs123.my.connect.aws/connect/ccp-v2';
        // initialize the ccp
        connect.core.initCCP(containerDiv, {
          ccpUrl: instanceURL,            // REQUIRED
          loginPopup: true,               // optional, defaults to `true`
          loginPopupAutoClose: true,      // optional, defaults to `false`
          loginOptions: {                 // optional, if provided opens login in new window
            autoClose: true,              // optional, defaults to `false`
            height: 600,                  // optional, defaults to 578
            width: 400,                   // optional, defaults to 433
            top: 100,                       // Distance from top of screen in pixels
            left: 200,                      // Distance from left of screen in pixels
                            // optional, defaults to 0
            disableAuthPopupAfterLogout: false // optional, determines if CCP should trigger the login popup after being logged out. Defaults to false.
          },
          region: 'eu-central-1', // REQUIRED for `CHAT`, optional otherwise
          softphone: {
            // optional, defaults below apply if not provided
            allowFramedSoftphone: true, // optional, defaults to false
            disableRingtone: false, // optional, defaults to false
            disableEchoCancellation: false, // optional, defaults to false
            allowFramedVideoCall: true, // optional, default to false
            allowFramedScreenSharing: true, // optional, default to false
            allowFramedScreenSharingPopUp: true, // optional, default to false
            VDIPlatform: null, // optional, provide with 'CITRIX' if using Citrix VDI, or use enum VDIPlatformType
            allowEarlyGum: true, //optional, default to true
          },
          pageOptions: { //optional
            enableAudioDeviceSettings: false, //optional, defaults to 'false'
            enableVideoDeviceSettings: false, //optional, defaults to 'false'
            enablePhoneTypeSettings: true, //optional, defaults to 'true'
            showInactivityModal: false, // optional, determines if the inactivity modal should render in the CCP iframe. Defaults to true.
          }
        });

        // connect.agent((agent: any) => {
        //   this.router.navigate(['inventory/all']);
        // });
         connect.agent((agent: any) => {
        console.log("agent");
            if (agent){
              this.router.navigate(['home']);
            }
          });


        }
}
