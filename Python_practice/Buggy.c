#include<stdio.h>
void Print_len(int Height);
int main(){
    int Height;
    printf("Height: ");
    scanf("%d",&Height);
    Print_len(Height);
}
void Print_len(int Height){
    for(int i=0;i<Height;i++){
        printf("#\n");
    }
}