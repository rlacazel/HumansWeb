module.exports = {
    // 0:CommitStateInjury(i2,unknown,good)@1:Take(n2,g2)@2:VictNotBreathing(i2,good,v2)@3:VictDie(i2,good,v2)@4:Apply(n2,g2,v1,i1,rleg)
    convert_plan_to_ev: function(plan_action)
    {
        var action_ev;
        var match_param = plan_action.match(/\(([^)]+)\)/);
        if (match_param == null)
        {
            return null;
        }
        var params = match_param[1].split(',');
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
            // we don't care about injury, it is specific to planner
            action_ev+=':'+params[0]; // character
            action_ev+=':'+params[1]; // action type
            action_ev+=':'+params[2]; // patient
            action_ev+=':'+params[4]; // bodypart
        }
        // CommitStateInjury(newtstae,patient,bodypart) -> add victim and bodypart
        else if(plan_action.startsWith('CommitStateInjury('))
        {
            action_ev = "attribute:is-bloodstain-";
            var body = params[2];
            if(body.startsWith('r')) {
                action_ev += "right-"
            } else if (body.startsWith('l')) {
                action_ev += "left-"
            }
            action_ev += body.substring(1) + ':';
            var state = params[0];
            if(state == 'good') {
                action_ev += "0";
            } else  if(state == 'average') {
                action_ev += "0.5";
            } else  if(state == 'bad') {
                action_ev += "1";
            }
            action_ev += ':' + params[1];
        }
        else if(plan_action.startsWith('VictNotBreathing('))
        {
            action_ev = "attribute:is-breathing:0:";
            action_ev += params[0];
        }
        else if(plan_action.startsWith('VictDie('))
        {

        }
        return action_ev;
    }
};