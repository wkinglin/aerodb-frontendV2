// '根据系统可靠度，二分迭代反算单元可靠度
export function Hot_Cmd_R_Click(n,k,Rsys){
    let R_Range=[]
    R_Range[1]=0
    R_Range[3]=1
    let ErrTemp=1
    let RsysComp=0
    while(ErrTemp >= 0.000001){
        R_Range[2] = (R_Range[1] + R_Range[3]) / 2
        RsysComp = RsysHot(n, k, R_Range[2])
        ErrTemp = R_Range[3] - R_Range[1]
        if(RsysComp < Rsys)
            R_Range[1] = R_Range[2]
        else
            R_Range[3] = R_Range[2]
    }
    let R = (R_Range[1] + R_Range[3]) / 2
    return R;
}

// console.log(Cmd_R_Click(4,3,0.999996))
// console.log(Cmd_Rsys_Click(4,3,0.961346859))
// '根据单元可靠度计算系统可靠度
export function Hot_Cmd_Rsys_Click(n,k,R){
    let Rsys = RsysHot(n, k, R)
    return Rsys
}
// '===================================================
// '计算 k/n 热备份的可靠度
// '不考虑表决器
function RsysHot(n,k,R){
    let Ret=0
    for(let i=k;i<=n;i++){
        Ret+=Fact(n)*1.0/Fact(i)/Fact(n-i)* Math.pow(R,i) * Math.pow(1-R,n - i)
    }
    return Ret
}
// 计算 阶乘
function Fact(m){
    let fact=1
    if(m>0){
        for(let i=1;i<=m;i++){
            fact*=i
        }
    }
    return fact*1.0;
}