(function(root){
const recipes=[
{name:'Doodh Rooh Afza',amounts:{milk:10,syrup:4},action:'stir',prompt:'Make it 4 pt rose-sweet.'},
{name:'Meethi Lassi',amounts:{milk:10,sugar:4,ice:2},action:'shake',prompt:'Make it 4 pt sweet, and nicely chilled.'},
{name:'Doodh Patti',amounts:{tea:6,milk:10},action:'boil',prompt:'A milky chai. No sugar this time.'},
{name:'Doodh Soda',amounts:{milk:10,sprite:6,ice:2},action:'stir',prompt:'Cold, milky and fizzy. Stir gently.'},
{name:'Shikanjvi',amounts:{lemon:4,salt:1,sugar:4,ice:3},action:'shake',prompt:'4 pt sweet, with a little salty tang.'}
];
function judge(recipe,amounts,action,timeLeft){if(timeLeft<=0)return {ok:false,reason:'Time’s up! The next cup is yours.'};for(const [key,amount] of Object.entries(amounts)){if(amount>0&&!recipe.amounts[key])return {ok:false,reason:'An extra ingredient slipped in. Follow the receipt exactly.'};}for(const [key,amount] of Object.entries(recipe.amounts)){if((amounts[key]||0)!==amount)return {ok:false,reason:'The amounts don’t match yet. Check the points on your receipt.'};}if(action!==recipe.action)return {ok:false,reason:'Finish with '+recipe.action+' after adding all your ingredients.'};return {ok:true,reason:'Wah, kya baat hai! Made just right.'};}
root.CafeRules={recipes,judge};if(typeof module!=='undefined')module.exports=root.CafeRules;
})(typeof window!=='undefined'?window:globalThis);
