import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles:[`
  ::ng-deep nb-layout-column {
    justify-content: center;
    display: flex;
  }
  nb-chat {
    width: 100%;
    max-height:90vh;
  }
  body{
  }
`]
})
export class HomeComponent implements OnInit {

  messages = [];
  loading = false;
  userDetails: any;
  sessionId: any;
  constructor(private http:HttpClient) { }

  ngOnInit(): void {
    this.sessionId = Date.now()
    this.userDetails = JSON.parse(localStorage.getItem("userDetails"))
    this.handleUserMessage({
      message:"hi"
    },false, true)
  }
  addUserMessage(text) {
    this.messages.push({
      text,
      sender: 'You',
      reply: true,
      date: new Date()
    });
  }

  addBotMessage(text) {
    this.messages.push({
      text,
      sender: 'Bot',
      avatar: '',
      date: new Date()
    });
  }

  async handleUserMessage(event,hideBotMessage = false,hideUserMessage = false) {
    console.log(event);
    const text = event.message;
    if(!hideUserMessage){
      this.addUserMessage(text);
    }

    this.loading = true;

    // Make the request 
    await this.http.post<any>(
      `${environment.API_ENDPOINT}/action`,
      {
        input_string:text,
        username: this.userDetails['username'],
        sessionId: this.sessionId
      }
    )
    .subscribe(res => {
      if(!hideBotMessage){
        this.addBotMessage(res.response)
      }
      this.loading = false;
    });
  }

}
