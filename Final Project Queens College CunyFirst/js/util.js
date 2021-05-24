function intToTime(i){
	ans = i%1200
  if(i%1200 < 10)ans = "120" + ans;
  else if(i%1200 < 100) ans = "12" + ans;
  ans = ans.toString()
  if(i >= 1200) ans += "PM"
  else ans += "AM"
  if(i%1200 < 1000 && i%1200 >= 100)return ans.slice(0, 1) + ":" + ans.slice(1, ans.length);
  else return ans.slice(0, 2) + ":" + ans.slice(2, ans.length);
}
module.exports.intToTime = intToTime