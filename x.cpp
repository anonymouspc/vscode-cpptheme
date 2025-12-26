struct B { 
    virtual int func();
    void haha();
    void haha(int);
    void haha(double);
};

struct A
    : public B
{
    virtual int func() override;
};

struct C
    : public B
{
    virtual int func() override;
};


void B::haha() { }
void B::haha(int) { }
void B::haha(double) { }



int A::func() {
    B().haha();
    return 2;
}

int B::func() {
    return 1;
}

int C::func() {
    return 3;
}

int func() {
    auto a = A();
    a.func();
}