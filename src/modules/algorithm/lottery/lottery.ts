import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-lottery',
    templateUrl: './lottery.html',
    imports: [
        FormsModule, CommonModule
    ],
    styleUrls: ['./lottery.scss']
})
export class Lottery {
    // 钻石档次配置
    diamondGrades = [
        {diamonds: 100, winners: 1},    // 高档：100钻石，1人中奖
        {diamonds: 50, winners: 5},     // 中档：50钻石，5人中奖
        {diamonds: 10, winners: 20}     // 低档：10钻石，20人中奖
    ];

    // 总参与人数
    totalParticipants = 100;

    // 总钻石数配置
    totalDiamondsConfig: number = 100000;  // 默认10万钻石

    // 参与者列表
    participants: number[] = [];

    // 中奖者列表
    winners: any[] = [];

    // 动画钻石
    animatedDiamonds: any[] = [];

    constructor()
    {
        this.generateParticipants();
        this.generateDiamonds();
        this.autoAdjustGrades();  // 初始化时自动调整档次分配
    }

    // 添加新档次
    addGrade(): void
    {
        this.diamondGrades.push({diamonds: 10, winners: 1});
        this.autoAdjustGrades();  // 添加后自动调整
    }

    // 移除档次
    removeGrade(index: number): void
    {
        if (this.diamondGrades.length > 1) {
            this.diamondGrades.splice(index, 1);
            this.autoAdjustGrades();  // 移除后自动调整
        }
    }

    // 根据总钻石数自动调整档次分配
    autoAdjustGrades(): void
    {
        const totalWinners = this.diamondGrades.reduce((sum,
                                                        grade) => sum + grade.winners, 0);
        const averageDiamonds = this.totalDiamondsConfig / totalWinners;

        this.diamondGrades.forEach(grade =>
        {
            // 根据钻石数量比例调整中奖人数
            grade.winners = Math.max(1, Math.round(this.totalDiamondsConfig * (1 / grade.diamonds) / 10));
        });

        // 确保总钻石数匹配
        this.adjustToTotalDiamonds();
    }

    // 确保实际总钻石数等于配置值
    adjustToTotalDiamonds(): void
    {
        const currentTotal = this.currentTotalDiamonds;
        const difference = this.totalDiamondsConfig - currentTotal;

        if (difference !== 0) {
            // 找到钻石数最接近的档次进行调整
            const closestGrade = this.diamondGrades.reduce((closest,
                                                            grade) =>
                Math.abs(grade.diamonds - Math.abs(difference)) <
                Math.abs(closest.diamonds - Math.abs(difference)) ? grade : closest);

            // 调整该档次的人数
            closestGrade.winners += Math.round(difference / closestGrade.diamonds);
        }
    }

    // 计算当前实际总钻石数
    get currentTotalDiamonds(): number
    {
        return this.diamondGrades.reduce((total,
                                          grade) =>
            total + (grade.diamonds * grade.winners), 0);
    }

    // 生成参与者ID
    generateParticipants(): void
    {
        this.participants = Array.from(
            {length: this.totalParticipants},
            (_,
             i) => i + 1
        );
        this.winners = [];
    }

    // 生成动画钻石
    generateDiamonds(): void
    {
        this.animatedDiamonds = Array.from({length: 20}, (_,
                                                          i) => ({
            x: Math.random() * 90,
            y: Math.random() * 90,
            delay: Math.random() * 2
        }));
    }

    // 执行抽奖
    runLottery(): void
    {
        // 重置中奖者
        this.winners = [];

        // 创建参与者副本
        let pool = [...this.participants];

        // 按档次抽奖
        this.diamondGrades.forEach((grade,
                                    gradeIndex) =>
        {
            // 当前档次中奖者
            const gradeWinners = [];

            // 随机抽取中奖者
            for (let i = 0; i < grade.winners; i++) {
                if (pool.length === 0) break;

                const randomIndex = Math.floor(Math.random() * pool.length);
                const winnerId = pool.splice(randomIndex, 1)[0];

                gradeWinners.push({
                    id: winnerId,
                    grade: gradeIndex + 1,
                    diamonds: grade.diamonds
                });
            }

            // 添加到总中奖列表
            this.winners = [...this.winners, ...gradeWinners];
        });
    }

    // 重置系统
    reset(): void
    {
        this.diamondGrades = [
            {diamonds: 100, winners: 1},
            {diamonds: 50, winners: 5},
            {diamonds: 10, winners: 20}
        ];
        this.totalParticipants = 100;
        this.totalDiamondsConfig = 100000;
        this.generateParticipants();
        this.autoAdjustGrades();
    }
}
