import threading
x=0
def task():
    global x
    for i in range(10000):
        x+=1

t1=threading.Thread(target=task)
t2=threading.Thread(target=task)

t1.start()
t2.start()
