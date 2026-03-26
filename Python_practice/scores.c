#include<stdio.h>
const int N=3;
float ave(int lenght,int array[]);
int main(void){
    int scores[N];
    printf("Enter values : \n");
    for(int i=0;i<N;i++){
        scanf("%d",&scores[i]);
    }
    printf("Average :%f ", ave(N,scores));
}
float ave(int length, int array[]){
    int sum=0;
    for(int i=0;i<N;i++){
        sum+=array[i];
    }
    return sum / (float) length;
}