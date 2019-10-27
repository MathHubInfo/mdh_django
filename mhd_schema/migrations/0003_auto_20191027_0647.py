# Generated by Django 2.2.4 on 2019-10-27 06:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mhd_schema', '0002_collection_flag_large_collection'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='description',
            field=models.TextField(default='', help_text='A human-readable description of this property'),
        ),
        migrations.AddField(
            model_name='property',
            name='url',
            field=models.URLField(blank=True, help_text='URL for more information about this property', null=True),
        ),
    ]
