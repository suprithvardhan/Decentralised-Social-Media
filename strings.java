import java.util.*;

class splitStrings{
    public String part1 = "";
    public String part2 = "";
    public String part3 = "";

    splitStrings(String part1,String part2,String part3)
    {
        this.part1 = part1;
        this.part2 = part2;
        this.part3= part3;
    }

}
class strings {
    public static splitStrings solve(String input)
    {
        int len = input.length();
        int cperpart = len/3;
        String part1 = "";
        String part2 = "";
        String part3 = "";

        if(len%3==0)
        {
            part1 = input.substring(0, cperpart);
            System.out.println("first split: "+part1);
            part2 = input.substring(cperpart, cperpart*2);
            System.out.println("second split: "+part2);
            part3 = input.substring(cperpart*2);
            System.out.println("third split: "+part3);
        }
        else if(len%3==1)
        {
            part1 = input.substring(0, cperpart);
            System.out.println("first split: "+part1);
            part2 = input.substring(cperpart, cperpart*2+1);
            System.out.println("second split: "+part2);
            part3 = input.substring(cperpart*2+1);
            System.out.println("third split: "+part3);
        }
        else
        {
            part1 = input.substring(0, cperpart+1);
            System.out.println("first split: "+part1);
            part2 = input.substring(cperpart+1, cperpart*2+1);
            System.out.println("second split: "+part2);
            part3 = input.substring(cperpart*2+1);
            System.out.println("third split: "+part3);
        }
        return new splitStrings(part1, part2, part3);

    }
    public static void main(String[] args) { 
        Scanner sc = new Scanner(System.in);
        String input1 = sc.nextLine();
        String input2 = sc.nextLine();
        String input3 = sc.nextLine();
        splitStrings res1 = solve(input1);
        splitStrings res2 = solve(input2);
        splitStrings res3 = solve(input3);
        String output1 = res1.part1 + res2.part3 + res3.part2;
        String output2 = res1.part2 + res2.part2 + res3.part3;
        String output3 = res1.part3 + res2.part2 + res3.part1;
        System.out.println(output1+"\n"+output2+"\n"+output3);
        sc.close();
    }
}