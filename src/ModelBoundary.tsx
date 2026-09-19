import {Component,type ReactNode} from 'react';
export default class ModelBoundary extends Component<{children:ReactNode;onReturn?:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<section className="model-loading" role="alert"><p>The model could not be loaded.</p><button onClick={()=>location.reload()}>Reload page</button>{this.props.onReturn&&<button onClick={this.props.onReturn}>Return to room</button>}</section>:this.props.children;}
}
