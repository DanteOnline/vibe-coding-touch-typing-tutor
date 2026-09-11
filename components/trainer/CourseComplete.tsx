import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CourseComplete() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle>Курс завершён!</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Вы успешно прошли все уровни. Можете продолжать практику на любом
        предыдущем уровне через переключатель выше.
      </CardContent>
    </Card>
  );
}
