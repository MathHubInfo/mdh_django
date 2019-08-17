# Generated by Django 2.2.4 on 2019-08-17 15:00

from django.db import migrations, models
import django.db.models.deletion
import mdh.utils.uuid
import mdh_data.fields.ndarray


class Migration(migrations.Migration):

    dependencies = [
        ('mdh_schema', '0001_initial'),
        ('mdh_provenance', '0001_initial'),
        ('mdh_data', '0004_standardjson'),
    ]

    operations = [
        migrations.CreateModel(
            name='PolynomialAsSparseArray',
            fields=[
                ('id', models.UUIDField(default=mdh.utils.uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('active', models.BooleanField(default=True, help_text='Is this item active')),
                ('value', mdh_data.fields.ndarray.SmartNDArrayField(dim=1, typ=models.IntegerField())),
                ('item', models.ForeignKey(help_text='Item this this cell represents', on_delete=django.db.models.deletion.CASCADE, to='mdh_data.Item')),
                ('prop', models.ForeignKey(help_text='Property this cell represents', on_delete=django.db.models.deletion.CASCADE, to='mdh_schema.Property')),
                ('provenance', models.ForeignKey(help_text='Provenance of this cell', on_delete=django.db.models.deletion.CASCADE, to='mdh_provenance.Provenance')),
                ('superseeded_by', models.ForeignKey(blank=True, help_text='Cell this value is superseeded by', null=True, on_delete=django.db.models.deletion.SET_NULL, to='mdh_data.PolynomialAsSparseArray')),
            ],
            options={
                'abstract': False,
                'unique_together': {('item', 'prop', 'superseeded_by')},
            },
        ),
        migrations.CreateModel(
            name='MatrixAsList_StandardInt_2',
            fields=[
                ('id', models.UUIDField(default=mdh.utils.uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('active', models.BooleanField(default=True, help_text='Is this item active')),
                ('value', mdh_data.fields.ndarray.SmartNDArrayField(dim=2, typ=models.IntegerField())),
                ('item', models.ForeignKey(help_text='Item this this cell represents', on_delete=django.db.models.deletion.CASCADE, to='mdh_data.Item')),
                ('prop', models.ForeignKey(help_text='Property this cell represents', on_delete=django.db.models.deletion.CASCADE, to='mdh_schema.Property')),
                ('provenance', models.ForeignKey(help_text='Provenance of this cell', on_delete=django.db.models.deletion.CASCADE, to='mdh_provenance.Provenance')),
                ('superseeded_by', models.ForeignKey(blank=True, help_text='Cell this value is superseeded by', null=True, on_delete=django.db.models.deletion.SET_NULL, to='mdh_data.MatrixAsList_StandardInt_2')),
            ],
            options={
                'abstract': False,
                'unique_together': {('item', 'prop', 'superseeded_by')},
            },
        ),
        migrations.CreateModel(
            name='ListAsArray_StandardInt',
            fields=[
                ('id', models.UUIDField(default=mdh.utils.uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('active', models.BooleanField(default=True, help_text='Is this item active')),
                ('value', mdh_data.fields.ndarray.SmartNDArrayField(dim=1, typ=models.IntegerField())),
                ('item', models.ForeignKey(help_text='Item this this cell represents', on_delete=django.db.models.deletion.CASCADE, to='mdh_data.Item')),
                ('prop', models.ForeignKey(help_text='Property this cell represents', on_delete=django.db.models.deletion.CASCADE, to='mdh_schema.Property')),
                ('provenance', models.ForeignKey(help_text='Provenance of this cell', on_delete=django.db.models.deletion.CASCADE, to='mdh_provenance.Provenance')),
                ('superseeded_by', models.ForeignKey(blank=True, help_text='Cell this value is superseeded by', null=True, on_delete=django.db.models.deletion.SET_NULL, to='mdh_data.ListAsArray_StandardInt')),
            ],
            options={
                'abstract': False,
                'unique_together': {('item', 'prop', 'superseeded_by')},
            },
        ),
    ]
