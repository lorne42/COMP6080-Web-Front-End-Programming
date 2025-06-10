import "./dashboard.css"
import { useState, useEffect } from 'react';
const Dashboard = ()=> {
  const [numWon, setNumwon] = useState();
  
  function checkwon() {
    
    const wonnum = localStorage.getItem("number")

    if (wonnum<=0){
      window.alert("Congratulations!")
      const url = "https://cgi.cse.unsw.edu.au/~cs6080/raw/data/score.json"
      fetch(url)
      .then(res=>res.json())
      .then((res)=>{
        setNumwon(res.score)
        localStorage.setItem("number", res.score)
      })
    }
    
  }

  const resetClick = ()=>{
    const url = "https://cgi.cse.unsw.edu.au/~cs6080/raw/data/score.json"
      fetch(url)
      .then(res=>res.json())
      .then((res)=>{
        setNumwon(res.score)
        localStorage.setItem("number", res.score)
      })

  }
  useEffect(() => {
    const num = localStorage.getItem("number")
    if(num){
      setNumwon(parseInt(num))
    }else{
      const url = "https://cgi.cse.unsw.edu.au/~cs6080/raw/data/score.json"
      fetch(url)
      .then(res=>res.json())
      .then((res)=>{
        setNumwon(res.score)
        localStorage.setItem("number", res.score)
      })
    }
    checkwon();
  }, []);
  
  return(

    <div className="dashboard">
      <div className="t1">Choose your option from the footer.</div>
      <div>Games you need to win: {numWon}</div>
      <button className="reset" onClick={() => resetClick()}> reset </button>
    </div>
      
  );
}
export default Dashboard; // 必须有默认导出