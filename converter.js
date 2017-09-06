module.exports = {
    // 0:CommitStateInjury(i2,unknown,good)@1:Take(n2,g2)@2:VictNotBreathing(i2,good,v2)@3:VictDie(i2,good,v2)@4:Apply(n2,g2,v1,i1,rleg)
    convert_action_plan_to_action_executable_in_ev: function(plan_action)
    {
        var actions_ev = [];
        var match_param = plan_action.match(/\(([^)]+)\)/);
        if (match_param != null) {
            var params = match_param[1].split(',');
            // Take(character,objecturi)
            /*if (plan_action.startsWith('Take(')) {
                var action_ev = "gotoandtake";
                for (i = 0; i < params.length; i++) {
                    action_ev += ':' + params[i];
                }
                actions_ev.push(action_ev);
            }*/
            // Apply(character,actiontype,patient,injury,bodypart)
            /*if (plan_action.startsWith('Apply(')) {
                var action_ev = "gotoandanimate";
                // we don't care about injury, it is specific to planner
                action_ev += ':' + params[0]; // character
                action_ev += ':' + params[1]; // action type
                action_ev += ':' + params[2]; // patient
                action_ev += ':' + params[4]; // bodypart
                actions_ev.push(action_ev);
            }
            // CommitStateInjury(newtstae,patient,bodypart) -> add victim and bodypart
            else */
            if (plan_action.startsWith('CommitStateInjury(')) {
                var action_ev = "attribute:is-bloodstain-";
                var body = params[2];
                if (body.startsWith('r')) {
                    action_ev += "right-"
                } else if (body.startsWith('l')) {
                    action_ev += "left-"
                }
                action_ev += body.substring(1) + ':';
                var state = params[0];
                if (state == 'good') {
                    action_ev += "0";
                } else if (state == 'average') {
                    action_ev += "0.5";
                } else if (state == 'bad') {
                    action_ev += "1";
                }
                action_ev += ':' + params[1];
                actions_ev.push(action_ev);
            }
            else if (plan_action.startsWith('VictNotBreathing(')) {
                var action_ev = "attribute:is-breathing:0:";
                action_ev += params[0];
                actions_ev.push(action_ev);
            }
            else if (plan_action.startsWith('GarrotBreak(')) {
                var action_ev = "removeinstance";
                action_ev += ':' + params[0]; // uri
                actions_ev.push(action_ev);
            }
            else if (plan_action.startsWith('VictDie(')) {
                var action_ev = "attribute:is-breathing:0:";
                action_ev += params[0];
                actions_ev.push(action_ev);
                var action_ev = "attribute:is-grumbling:0:";
                action_ev += params[0];
                actions_ev.push(action_ev);
            }
        }
        return actions_ev;
    },
    convert_humans_msg_to_storyline_msg: function(msg)
    {
        var res = msg.replace('attribute','Attribute').replace('gotoandanimate','GotoAndAnimate')
            .replace('gotoandtake','GotoAndTake').replace('removeinstance','RemoveInstance');
        var split = res.split(':');
        var res2 = '';
        for(var i = 1; i < split.length; i++)
        {
            if (i == 1)
            {
                res2 = split[0] + "(" + split[1];
            }
            else
            {
                res2 += ", " + split[i];
            }
        }
        res2 += ')'
        return res2;
    }
};