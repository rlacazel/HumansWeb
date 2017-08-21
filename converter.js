module.exports = {
    // 0:CommitStateInjury(i2,unknown,good)@1:Take(n2,g2)@2:VictNotBreathing(i2,good,v2)@3:VictDie(i2,good,v2)@4:Apply(n2,g2,v1,i1,rleg)
    convert_plan_to_ev: function(plan_action)
    {
        var action_ev;
        var fullparams = plan_action.match(/\(([^)]+)\)/)[1];
        var params = fullparams.split(',');
        // Take(character,objecturi)
        if(plan_action.startsWith('Take('))
        {
            action_ev = "gotoandtake";
            for(i=0;i<params.length;i++)
            {
                action_ev+=':'+params[i];
            }
        }
        // Apply(character,actiontype,patient,injury,bodypart)
        else if(plan_action.startsWith('Apply('))
        {
            action_ev = "gotoandanimate";
            for(i=0;i<params.length;i++)
            {
                // we don't care about injury, it is specific to planner
                action_ev+=':'+params[0]; // character
                action_ev+=':'+params[1]; // action type
                action_ev+=':'+params[2]; // patient
                action_ev+=':'+params[4]; // bodypart
            }
        }
        return action_ev;
    }
};