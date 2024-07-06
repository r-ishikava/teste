def main():
    n = 10
    count = 0
    for i in range(1, n):
        for _ in range(2, n+1):
            for _ in range(i, n+1):
                count += 1

    print(count)

main()
