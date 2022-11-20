#include <stdio.h>
void print_matrix(int *G, int row, int col)
{
    for (int i = 0; i < row; i++)
    {
        for (int j = 0; j < col; j++)
        {
            int a = *(G + i * col + j);
            printf("%d ", a + 1);
        }
        printf("\n");
    }
}

void print_arr(int M[], int len)
{
    for (int i = 0; i < len; i++)
    {
        int a = M[i];
        printf("%d ", a + 1);
    }
    printf("\n");
}

int NOT_IN(int arr[], int arrLength, int value)
{

    for (int i = 0; i < arrLength; i++)
    {
        if (arr[i] == value)
        {

            return 0;
        }
    }
    return 1;
}

void ComputeT(
    int *G,
    int GLength,
    int M[],
    int T[],
    int *TLength,
    int stateLength)
{
    for (int i = 0; i < stateLength; i++)
    {
        int vertex = M[i];
        int row = vertex * GLength;
        for (int j = 0; j < GLength; j++)
        {
            // 需要排除已经被添加到状态中的点，以及已经被添加到terminal中的点
            if (*(G + row + j) == 1 && NOT_IN(M, stateLength, j) && NOT_IN(T, *TLength, j))
            {
                T[*TLength] = j;
                (*TLength)++;
            }
        }
    }
}

void ComputeP(
    int *G1,
    int *G2,
    int p1,
    int p2,
    int M1[],
    int M2[],
    int T1[],
    int *T1Length,
    int T2[],
    int *T2Length,
    int *P,
    int *PLength,
    int stateLength)
{

    ComputeT(G1, p1, M1, T1, T1Length, stateLength);
    ComputeT(G2, p2, M2, T2, T2Length, stateLength);
    if (*T1Length == 0 && *T2Length == 0)
    {
        for (int i = 0; i < p1; i++)
        {
            int row = (*PLength) * 2;
            int m = 0;
            int n = i;
            *(P + row) = n;
            *(P + row + 1) = m;
            (*PLength)++;
        }
        return;
    }
    if (*T2Length == 0 || *T1Length == 0)
    {
        return;
    }
    int min = T2[0];
    for (int i = 1; i < *T2Length; i++)
    {
        if (T2[i] < min)
        {
            min = T2[i];
        }
    }
    for (int i = 0; i < *T1Length; i++)
    {
        int row = (*PLength) * 2;
        int m = min;
        int n = T1[i];
        *(P + row) = n;
        *(P + row + 1) = m;
        (*PLength)++;
    }
}

/**
 *  校验连接点在Partial Mapping中一一对应 
 **/
int R_0(
    int *state,
    int stateLength,
    int *G1,
    int *G2,
    int p1,
    int p2,
    int *p)
{
    int n = *p;
    int m = *(p + 1);
    for (int i = 0; i < stateLength; i++)
    {
        int n_ = *(state + i * 2);
        int m_ = *(state + i * 2 + 1);
        int n_connected_with_n_ = *(G1 + n * p1 + n_);
        int m_connected_with_m_ = *(G2 + m * p2 + m_);
        // if (n_connected_with_n_ == 1 && m_connected_with_m_ == 0)
        // {
        //     return 0;
        // }
        if (m_connected_with_m_ == 1 && n_connected_with_n_ == 0)
        {
            return 0;
        }
    }
    return 1;
}

/**
 *  校验待进入当前状态的pair在T中的度, n的度需要大于等于m
 **/
int R_1(
    int *G1,
    int *G2,
    int p1,
    int p2,
    int T1[],
    int *T1Length,
    int T2[],
    int *T2Length,
    int *p)
{
    int n = *p;
    int m = *(p + 1);
    int nLength = 0;
    int mLength = 0;
    for (int i = 0; i < *T1Length; i++)
    {
        if (*(G1 + T1[i] * p1 + n) == 1)
        {
            nLength++;
        };
    }
    for (int i = 0; i < *T2Length; i++)
    {
        if (*(G2 + T2[i] * p2 + m) == 1)
        {
            mLength++;
        };
    }
    if (nLength >= mLength)
    {
        return 1;
    }
    return 0;
}

// 检验原图中的点在状态外的度数要大于子图
int R_new(
    int *G1,
    int *G2,
    int p1,
    int p2,
    int M1[],
    int M2[],
    int T1[],
    int *T1Length,
    int T2[],
    int *T2Length,
    int *p,
    int stateLength)
{
    int n = *p;
    int m = *(p + 1);
    int nLength = 0;
    int mLength = 0;
    for (int i = 0; i < p1; i++)
    {
        if (*(G1 + n * p1 + i) == 1 && NOT_IN(M1, stateLength, i) && NOT_IN(T1, *T1Length, i))
        {
            nLength++;
        }
    }
    for (int i = 0; i < p2; i++)
    {
        if (*(G2 + m * p2 + i) == 1 && NOT_IN(M2, stateLength, i) && NOT_IN(T2, *T2Length, i))
        {
            mLength++;
        }
    }
    if (nLength >= mLength)
    {
        return 1;
    }
    return 0;
}

void ComputeM(
    int *state,
    int stateLength,
    int M[],
    int index)
{
    for (int i = 0; i < stateLength; i++)
    {
        M[i] = *(state + i * 2 + index);
    }
}
int result = 0;
void Match(
    int *state,
    int stateLength,
    int p1,
    int p2,
    int *G1,
    int *G2,
    int result[],
    int *resultLength)
{
    if (stateLength == p2)
    {
        for (int i = 0; i < p2; i++)
        {
            result[1 + (*resultLength) * p2 * 2 + 2 * i] = state[2 * i];
            result[1 + (*resultLength) * p2 * 2 + 2 * i + 1] = state[2 * i + 1];
        }
        (*resultLength)++;
        return;
    }

    int T1[p1];
    int T1Length = 0;
    int T2[p2];
    int T2Length = 0;
    int P[p1 * p2 * 2];
    int PLength = 0;
    int M1[p2];
    int M2[p2];
    ComputeM(state, stateLength, M1, 0);
    ComputeM(state, stateLength, M2, 1);
    ComputeP(
        G1,
        G2,
        p1,
        p2,
        M1,
        M2,
        T1,
        &T1Length,
        T2,
        &T2Length,
        P,
        &PLength,
        stateLength);

    for (int i = 0; i < PLength; i++)
    {
        int *p = &(P[i * 2]);
        int n = *p;
        int m = *(p + 1);
        int check_R_0 = R_0(state, stateLength, G1, G2, p1, p2, p);
        int check_R_1 = R_1(G1, G2, p1, p2, T1, &T1Length, T2, &T2Length, p);
        int check_R_new = R_new(G1, G2, p1, p2, M1, M2, T1, &T1Length, T2, &T2Length, p, stateLength);
        if (check_R_0 && check_R_1 && check_R_new)
        {
            *(state + stateLength * 2) = n;
            *(state + stateLength * 2 + 1) = m;
            int newStateLength = stateLength + 1;
            int newState[p2 * 2];
            for (int j = 0; j < newStateLength; j++)
            {
                newState[j * 2] = *(state + j * 2);
                newState[j * 2 + 1] = *(state + j * 2 + 1);
            }

            Match(newState, newStateLength, p1, p2, G1, G2, result, resultLength);
        }
    }
}

/**
 *  @param int G1[][] 原图
 *  @param int G2[][] 子图
 *  @param int p1 原图中点的个数
 *  @param int p2 子图中点的个数
 * 
 **/
int *VF(
    int p1,
    int p2,
    int *G1,
    int *G2)
{
    int resultLength = 0;
    int result[1000000];
    int state[p2 * 2];
    Match(state, 0, p1, p2, G1, G2, result, &resultLength);
    result[0] = resultLength;
    return result;
}

int main()
{
    // int G1[] = {0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0};
    // int G2[] = {0, 1, 1, 1, 0, 1, 1, 1, 0};
    int G1[] = {0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0};
    int G2[] = {0, 1, 0, 1, 0, 1, 0, 1, 0};
    VF(5, 3, G1, G2);
    return 0;
}
