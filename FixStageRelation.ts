import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class FixStageRelation1719604015830 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Удаляем текущий внешний ключ, если он ссылается на старую таблицу
    await queryRunner.dropForeignKey('opportunities', 'FK_opportunity_stage');

    // 2. Удаляем и добавляем заново колонку stage_id (если нужно)
    await queryRunner.dropColumn('opportunities', 'stage_id');

    await queryRunner.addColumn(
      'opportunities',
      new TableColumn({
        name: 'stage_id',
        type: 'integer',
        isNullable: false,
      }),
    );

    // 3. Добавляем новый внешний ключ на sales_funnel_stages
    await queryRunner.createForeignKey(
      'opportunities',
      new TableForeignKey({
        columnNames: ['stage_id'],
        referencedTableName: 'sales_funnel_stages',
        referencedColumnNames: ['stage_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Восстановление обратно (опционально)
    await queryRunner.dropForeignKey('opportunities', 'FK_opportunity_to_sales_funnel_stage');
    await queryRunner.addColumn(
      'opportunities',
      new TableColumn({
        name: 'stage_id',
        type: 'integer',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'opportunities',
      new TableForeignKey({
        columnNames: ['stage_id'],
        referencedTableName: 'opportunity_stages',
        referencedColumnNames: ['stage_id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }
}