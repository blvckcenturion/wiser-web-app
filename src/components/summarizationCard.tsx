const SummarizationCard = ({title, onClick, selected}: {title: string, onClick: any, selected: boolean}) => { 
    return (
        <div className={`${selected ? "bg-slate-900" : "hover:bg-slate-900"} transition-colors duration-200 px-4 py-2 my-1 w-full text-left`} onClick={onClick}>
            <h3>{title}</h3>
        </div>
    )
}

export default SummarizationCard;