from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('habits', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE OR REPLACE VIEW weekly_habit_summary_view AS
            SELECT
                h.id AS habit_id,
                h.user_id AS user_id,
                h.name AS habit_name,
                h.colour AS colour,
                h.days_per_week_goal AS days_per_week_goal,
                h.archived AS archived,
                COUNT(
                    CASE
                        WHEN c.date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                         AND c.date <= CURDATE()
                        THEN 1
                    END
                ) AS this_week_checkins,
                COUNT(
                    CASE
                        WHEN c.date >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
                         AND c.date <= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                        THEN 1
                    END
                ) AS last_week_checkins
            FROM habits h
            LEFT JOIN check_ins c ON c.habit_id = h.id
            GROUP BY
                h.id,
                h.user_id,
                h.name,
                h.colour,
                h.days_per_week_goal,
                h.archived;
            """,
            reverse_sql="DROP VIEW IF EXISTS weekly_habit_summary_view;"
        ),
    ]
