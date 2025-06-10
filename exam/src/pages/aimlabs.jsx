import "./aimlabs.css"
function Aimlabs() {
  
  return(
    <div className="board">
      <label>Time Limit (seconds)</label>
      <input type="text"  id="time"></input>
      <label>Goal</label>
      <input type="text"  id="goal"></input>
      <button className="start"> Start </button>
    </div>
   
    
  );
}
export default Aimlabs; // 必须有默认导出