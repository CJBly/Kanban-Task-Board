import {differenceInDays, parseISO} from 'date-fns';

export function getDueState(dueDate: string | null){
    if(!dueDate){
        return null;
    }
    const date = parseISO(dueDate);
    const dateDifference = differenceInDays(date, new Date());
    
    if(dateDifference <= 0){
        return "overdue";
    }
    else if(dateDifference <= 2){
        return "soon";
    }
    return "normal";
}