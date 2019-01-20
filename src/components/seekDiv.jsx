import React from 'react';
import {EventEmitter} from "events";
import { Dispatcher } from "flux";
import { socket } from "../../public/js/socket.js";

var dispatcher = new Dispatcher;
class GameStore extends EventEmitter{
	constructor(props){
		super(props);
		this.games = [];
	}

	fetchGames(){
	  	fetch('http://localhost:3000/seek/fetch',{cache:'no-cache'})
	  	.then(res => res.json())
	  	.then(data => {
        this.games.push(data.games)
        if(this.games.length > 1)
          this.games.splice(0,1)
      })
      .then( () => this.emit("change"))
	  	.catch(err => console.log(err))
 	}
	getAll(){
    return this.games;
	}

	handleActions(action){
		console.log("received action", action)
    if(action.type === 'FETCH_ALL_GAMES'){
      this.fetchGames();
    }
    if(action.type === 'LOAD_GAME'){
      this.games[0].push(action.payload);  
      this.emit("change")
    }
    if(action.type === 'DELETE_GAME'){
      this.games[0] = this.games[0].filter(x => x.userAlias !== action.payload);
      this.emit("change");
    }
	}
}

const gameStore = new GameStore;
dispatcher.register(gameStore.handleActions.bind(gameStore))

class Button extends React.Component{
  constructor(props){
    super(props);

    this.onClick = () => {
      var data = {};
      data.href = this.props.dataHref;
      data.id = this.props.dataId;
      data.userAlias = this.props.userAlias;
      socket.emit("joinGame", data)
    }
  }

  render(){
    return(
      <button onClick={this.onClick} className={this.props.className}>
        {this.props.children}
      </button>
    )
  }

}
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {games: gameStore.getAll()};
    this.user = null;
  }

  componentDidMount(){
    // fetch('/user',{ credentials : 'same-origin' })
    // .then(res => res.json())
    // .then(data => this.user = data)
    // .then(() => console.log(this.user))

    dispatcher.dispatch({type:'FETCH_ALL_GAMES'})
    gameStore.on("change", () => {
      this.setState({
        games: gameStore.getAll()
      })
    })
  }
  
  render() {
  	var games = this.state.games;
  	let zero;

    //console.log(games);
  	if(games.length === 0){
  		zero = ''
  	}else{
      //console.log(games);
  		zero = games[0].map(x => {
        return(
          <tr>
            <td>{x.userAlias}</td>
            <td>{x.rating}</td>
            <td>{x.time}</td>
            <td>{x.amount}</td>
            <td><Button className="btn btn-primary btn-sm" userAlias={x.userAlias} dataId={x.gameId} dataHref={`/game/${x.gameId}`}>Accept</Button></td>
          </tr>
        );
      });
  		//console.log(zero);
  	}
    return(
      <div>
        <div class="alert alert-danger" style={{'display':'none'}}> 
          <span> You don't have enough money on your account</span>
        </div>      
      	<table>
      		{zero}
      	</table>
      </div>
    );
  }
}

module.exports = {MyComponent,dispatcher};