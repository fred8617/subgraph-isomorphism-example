/**
 * 这个是自己重写的版本，原文中的版本采用了大量的goto语句，可读性与可维护性都不好，所以采用递归的方式重写了一次
 * */
int is_isomorphism(int *A, int *B, int pa, int pb, int *M)
{
    int temp[pa * pb];
    // M*B
    for (int i = 0; i < pa; i++)
    {
        for (int j = 0; j < pb; j++)
        {
            temp[i * pb + j] = 0;
            for (int k = 0; k < pb; k++)
            {
                temp[i * pb + j] += *(M + i * pb + k) * (*(B + k * pb + j));
            }
        }
    }

    int temp_t[pb * pa];
    // 转置
    for (int i = 0; i < pb; i++)
    {
        for (int j = 0; j < pa; j++)
        {
            temp_t[i * pa + j] = temp[j * pb + i];
        }
    }

    int C[pa * pa];
    // M*转置
    for (int i = 0; i < pa; i++)
    {
        for (int j = 0; j < pa; j++)
        {
            C[i * pa + j] = 0;
            for (int k = 0; k < pb; k++)
            {
                C[i * pa + j] += M[i * pb + k] * temp_t[k * pa + j];
            }
        }
    }
    int sign = 1;
    for (int i = 0; i < pa; i++)
    {
        for (int j = 0; j < pa; j++)
        {
            if (*(A + i * pa + j) == 1 && *(A + i * pa + j) != C[i * pa + j])
            {
                sign = 0;
                break;
            }
        }
    }
    return sign;
}
// 判断是否已经被选中
int chosen(int column[], int depth, int value)
{
    for (int i = 0; i < depth; i++)
    {
        if (column[i] == value)
        {
            return 1;
        }
    }
    return 0;
}

void pick(int *A, int *B, int pa, int pb, int *M0, int *result, int *result_length, int column[], int depth)
{
    if (depth == pa)
    {
        int M[pa * pb];
        for (int i = 0; i < pa; i++)
        {
            int chosen = column[i];
            for (int j = 0; j < pb; j++)
            {
                int value = 0;
                if (j == chosen)
                {
                    value = 1;
                }
                M[i * pb + j] = value;
            }
        }
        if (!is_isomorphism(A, B, pa, pb, M))
        {
            return;
        }
        int offset = 0;
        for (int i = 0; i < pa; i++)
        {
            for (int j = 0; j < pb; j++)
            {
                int value = *(M + i * pb + j);
                if (value)
                {
                    *(result + 1 + *result_length * 2 * pa + offset++) = i;
                    *(result + 1 + *result_length * 2 * pa + offset++) = j;
                }
            }
        }
        (*result_length)++;
        return;
    };
    for (int i = 0; i < pb; i++)
    {
        if (*(M0 + depth * pb + i) == 1 && !chosen(column, depth, i))
        {
            column[depth] = i;
            pick(A, B, pa, pb, M0, result, result_length, column, depth + 1);
            column[depth] = -1;
        }
    }
}

/**
 *  @param int A[][] 子图
 *  @param int B[][] 原图
 *  @param int pa 子图中点的个数
 *  @param int pb 原图中点的个数
 * 
 **/
int *ULLMANN(int pa, int pb, int A[], int B[])
{
    int result_length = 0;
    int result[1000000];
    // 一个pa * pb 的数组，如果M[i][j]中，Gb中第j个点的度大于等于Ga中第i个点的度，则设为1，这样可以有效排除不能同构的子图的点
    int M0[pa * pb];
    // 记录被选中列
    int column[pa];
    for (int i = 0; i < pa; i++)
    {
        column[i] = -1;
    }

    for (int i = 0; i < pa; i++)
    {
        int row = i * pb;
        for (int j = 0; j < pb; j++)
        {
            M0[row + j] = 0;
        }
    }

    for (int i = 0; i < pa; i++)
    {
        int count_a = 0;
        for (int k = 0; k < pa; k++)
        {
            if (*(A + i * pa + k) == 1)
            {
                count_a++;
            }
        }
        for (int j = 0; j < pb; j++)
        {
            int count_b = 0;
            for (int k = 0; k < pb; k++)
            {
                if (*(B + j * pb + k) == 1)
                {
                    count_b++;
                }
            }
            if (count_b >= count_a)
            {
                M0[i * pb + j] = 1;
            }
        }
    }
    pick(A, B, pa, pb, M0, result, &result_length, column, 0);
    result[0] = result_length;
    return result;
}

int main()
{
    int pa = 3;
    int pb = 5;
    int A[] = {0, 1, 0, 1, 0, 1, 0, 1, 0};
    int B[] = {0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0};
    ULLMANN(pa, pb, A, B);
    return 0;
}
