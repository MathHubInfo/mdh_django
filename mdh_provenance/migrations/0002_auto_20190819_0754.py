# Generated by Django 2.2.4 on 2019-08-19 07:54

from django.db import migrations
import mdh_data.fields.json


class Migration(migrations.Migration):

    dependencies = [
        ('mdh_provenance', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='provenance',
            name='metadatastring',
        ),
        migrations.AddField(
            model_name='provenance',
            name='metadata',
            field=mdh_data.fields.json.SmartJSONField(blank=True, help_text='Metadata associated with this object', null=True),
        ),
    ]