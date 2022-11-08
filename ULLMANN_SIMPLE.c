#include <stdio.h>
int pa = 0;
int pb = 0;
int max = 9999;
void print_matrix(int M[pa][pb])
{
    for (int i = 0; i < pa; i++)
    {
        for (int j = 0; j < pb; j++)
        {
            printf("%d ", M[i][j]);
        }
        printf("\n");
    }
}
/**
 * @param int a[][]为输出矩阵
 * @param int b[][]为被拷贝矩阵
 * 
 * */
void martix_copy(int a[pa][pb], int b[pa][pb])
{
    for (int i = 0; i < pa; i++)
    {
        for (int j = 0; j < pb; j++)
        {
            a[i][j] = b[i][j];
        }
    }
}

void is_isomorphism(int A[pa][pa], int B[pb][pb], int M[pa][pb], int result[max][pa][pb], int *result_length)
{
    int temp[pa][pb];
    // M*B
    for (int i = 0; i < pa; i++)
    {
        for (int j = 0; j < pb; j++)
        {
            temp[i][j] = 0;
            for (int k = 0; k < pb; k++)
            {
                temp[i][j] += M[i][k] * B[k][j];
            }
        }
    }

    int temp_t[pb][pa];
    // 转置
    for (int i = 0; i < pb; i++)
    {
        for (int j = 0; j < pa; j++)
        {
            temp_t[i][j] = temp[j][i];
        }
    }

    int C[pa][pa];
    // M*转置
    for (int i = 0; i < pa; i++)
    {
        for (int j = 0; j < pa; j++)
        {
            C[i][j] = 0;
            for (int k = 0; k < pb; k++)
            {
                C[i][j] += M[i][k] * temp_t[k][j];
            }
        }
    }
    int sign = 1;
    for (int i = 0; i < pa; i++)
    {
        for (int j = 0; j < pa; j++)
        {
            if (A[i][j] == 1 && A[i][j] != C[i][j])
            {
                sign = 0;
                break;
            }
        }
    }

    if (sign)
    {
        martix_copy(result[*result_length], M);
        (*result_length)++;
    }
}

/**
 *  @param int A[][] 子图
 *  @param int B[][] 原图
 *  @param int pa 子图中点的个数
 *  @param int pb 原图中点的个数
 *  @param int M0[][] 一个pa * pb 的数组，如果M[i][j]中，Gb中第j个点的度大于等于Ga中第i个点的度，则设为1，这样可以有效排除不能同构的子图的点
 * 
 **/
void ULLMANN_SIMPLE(int A[pa][pa], int B[pb][pb], int M0[pa][pb], int result[max][pa][pb], int *result_length)
{
    // step1
    int k = -1;
    // 深度
    int d = 0;
    // 作为中间状态，如果第i列被选中的话，记F[i]=1
    int F[pb];
    // 用于记录第k列在d层时被选，记为H[d]=k
    int H[pa];
    int M[pa][pb];
    martix_copy(M, M0);
    // 用于记录矩阵M在d层的拷贝
    int Md[pa][pa][pb];
    H[0] = -1;
    // 先将所有列都设置为未选中
    for (int i = 0; i < pb; i++)
    {
        F[i] = 0;
    }
    int step = 2;
    int sign = 0;
    int stop = 0;
    while (!stop)
    {
        switch (step)
        {
        case 2:
            // 设置一个标记
            sign = 0;
            for (int j = 0; j < pb; j++)
            {
                //如果当前深度中有某一列为1并且当前列未被选中，设置标记为1
                if (M[d][j] == 1 && F[j] == 0)
                {
                    sign = 1;
                    break;
                };
            }

            if (sign)
            {

                martix_copy(Md[d], M);
                //如果是第一层
                if (d == 0)
                {
                    k = H[0];
                }
                else
                {
                    k = -1;
                }
                step = 3;
            }
            else
            {
                step = 7;
            }
            break;
        case 3:
            // step3
            k++;
            // 如果M中在d层k列为0，或者第k列已经被选择，即F[k]==1
            if (M[d][k] == 0 || F[k] == 1)
            {
                // go to step3
                continue;
            }

            for (int j = 0; j < pb; j++)
            {
                if (j != k)
                {
                    //将非第k列的值设为0，即第k列被选中
                    M[d][j] = 0;
                }
            }
            step = 4;
            break;
        case 4:
            // 如果没到最后一层
            if (d < pa - 1)
            {
                step = 6;
            }
            else
            {
                is_isomorphism(A, B, M, result, result_length);
                martix_copy(M, Md[d]);
                F[k] = 0;
                step = 5;
            }
            break;
        case 5:
            sign = 0;
            for (int j = 0; j < pb; j++)
            {
                if (j > k && M[d][j] == 1 && F[j] == 0)
                {
                    sign = 1;
                }
            }
            if (sign)
            {
                step = 3;
            }
            else
            {
                step = 7;
            }
            break;
        case 6:
            H[d] = k;
            F[k] = 1;
            d++;
            step = 2;
            break;
        case 7:
            // 如果第一层就没有符合条件，那么直接退出算法
            if (d == 0)
            {
                stop = 1;
                break;
            }
            F[k] = 0;
            d--;
            martix_copy(M, Md[d]);
            k = H[d];
            F[k] = 0;
            step = 5;
            break;
        default:
            stop = 1;
            break;
        }
    }
}

int *callback(int a, int b, int _A[], int _B[])
{
    pa = a;
    pb = b;
    int A[pa][pa];
    int B[pb][pb];
    int M0[pa][pb];
    int result[max][pa][pb];
    int result_length = 0;
    int _result[99999];
    for (int i = 0; i < pa; i++)
    {
        for (int j = 0; j < pa; j++)
        {
            A[i][j] = _A[i * pa + j];
        }
    }
    for (int i = 0; i < pb; i++)
    {
        for (int j = 0; j < pb; j++)
        {
            B[i][j] = _B[i * pb + j];
        }
    }
    for (int i = 0; i < pa; i++)
    {
        int count_a = 0;
        for (int k = 0; k < pa; k++)
        {
            if (A[i][k] == 1)
            {
                count_a++;
            }
        }
        for (int j = 0; j < pb; j++)
        {

            int count_b = 0;
            for (int k = 0; k < pb; k++)
            {
                if (B[j][k] == 1)
                {
                    count_b++;
                }
            }
            if (count_b >= count_a)
            {
                M0[i][j] = 1;
            }
        }
    }

    ULLMANN_SIMPLE(A, B, M0, result, &result_length);
    _result[0] = result_length;
    int _result_index = 1;
    for (int i = 0; i < result_length; i++)
    {

        for (int j = 0; j < pa; j++)
        {
            for (int k = 0; k < pb; k++)
            {
                _result[_result_index++] = result[i][j][k];
            }
        }
    }
    return _result;
}

int main()
{
    pa = 3;
    pb = 5;
    int A[] = {0, 1, 0, 1, 0, 1, 0, 1, 0};
    int B[] = {0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0};
    int result[9999];
    callback(pa, pb, A, B);
    printf("result num:%d", result[0]);
    return 0;
}
