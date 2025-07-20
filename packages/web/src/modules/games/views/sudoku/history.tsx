import { Typography } from "@wingmnn/components";

export function SudokuHistory() {
  return (
    <div className="flex flex-col gap-6 pt-4 max-w-4xl mx-auto text-left">
      <Typography.Paragraph>
        Sudoku is a logic-based, combinatorial number-placement puzzle. The
        objective is to fill a 9×9 grid with digits so that each column, each
        row, and each of the nine 3×3 subgrids that compose the grid contains
        all of the digits from 1 to 9.
      </Typography.Paragraph>

      <div className="space-y-4">
        <Typography.H2 className="text-accent">How It Was Born</Typography.H2>
        <Typography.Paragraph>
          Contrary to popular belief, Sudoku isn't actually Japanese! The puzzle
          was invented by American architect
          <Typography.Anchor
            href="https://en.wikipedia.org/wiki/Howard_Garns"
            className="text-accent transition-all duration-200 hover:underline mx-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>Howard Garns</strong>
          </Typography.Anchor>
          in 1979. He called it "Number Place" and it first appeared in Dell
          Magazines' puzzle books.
        </Typography.Paragraph>
        <Typography.Paragraph>
          The puzzle was inspired by Latin squares, a mathematical concept
          dating back to the 18th century, created by Swiss mathematician{" "}
          <strong className="text-accent">Leonhard Euler</strong>. Think of it
          as Sudoku's great-great-grandfather!
        </Typography.Paragraph>
      </div>

      <div className="space-y-4">
        <Typography.H2 className="text-accent">
          How It Got Popular
        </Typography.H2>
        <Typography.Paragraph>
          Sudoku's journey to stardom began in Japan in the 1980s. The puzzle
          company Nikoli discovered it and gave it the name{" "}
          <strong className="text-accent">"Sudoku" (数独)</strong> - short for{" "}
          <strong className="text-accent">"Sūji wa dokushin ni kagiru"</strong>{" "}
          meaning "the digits must be single."
        </Typography.Paragraph>
        <Typography.Paragraph>
          But the real magic happened in 2004 when{" "}
          <strong className="text-accent">Wayne Gould</strong>, a retired judge
          from New Zealand, brought Sudoku to the world! He convinced The Times
          of London to publish it, and within months, it became a global
          phenomenon. Soon, everyone from your grandmother to your math teacher
          was addicted to these little number grids!
        </Typography.Paragraph>
        <Typography.Paragraph>
          By 2005, Sudoku was appearing in newspapers worldwide, and the rest is
          history. It's now one of the most popular puzzles ever created, with
          millions of people solving them daily.
        </Typography.Paragraph>
      </div>

      <div className="space-y-4">
        <Typography.H2 className="text-accent">How It's Played</Typography.H2>
        <Typography.Paragraph>
          The rules are beautifully simple:
        </Typography.Paragraph>
        <div className="bg-accent/20 p-4 rounded-lg">
          <ul className="space-y-2">
            <li>
              <Typography.Caption>
                • Fill the 9×9 grid with numbers 1-9
              </Typography.Caption>
            </li>
            <li>
              <Typography.Caption>
                • Each row must contain all digits 1-9 (no repeats!)
              </Typography.Caption>
            </li>
            <li>
              <Typography.Caption>
                • Each column must contain all digits 1-9 (no repeats!)
              </Typography.Caption>
            </li>
            <li>
              <Typography.Caption>
                • Each 3×3 box must contain all digits 1-9 (no repeats!)
              </Typography.Caption>
            </li>
          </ul>
        </div>
        <Typography.Paragraph>
          That's it! No math required - just pure logic and patience. It's like
          a crossword puzzle, but with numbers instead of words, and logic
          instead of vocabulary!
        </Typography.Paragraph>
      </div>

      <div className="space-y-4">
        <Typography.Paragraph>
          Let me give you some tips and tricks to help you solve Sudoku puzzles:
        </Typography.Paragraph>
        <div className="grid gap-4">
          <div className="bg-accent/20 p-4 rounded-lg">
            <Typography.Paragraph className="font-semibold text-accent">
              The Scanning Technique
            </Typography.Paragraph>
            <Typography.Caption>
              Look for numbers that appear frequently in the grid. Try to find
              where the missing instances should go in each row, column, and 3×3
              box.
            </Typography.Caption>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg">
            <Typography.Paragraph className="font-semibold text-accent">
              Pencil Mark Method
            </Typography.Paragraph>
            <Typography.Caption>
              Write small numbers in corners of empty cells to track
              possibilities. When you eliminate options, erase them. Sometimes
              you'll be left with just one possibility!
            </Typography.Caption>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg">
            <Typography.Paragraph className="font-semibold text-accent">
              Start with the Obvious
            </Typography.Paragraph>
            <Typography.Caption>
              Look for cells where only one number can fit. Fill these in first
              - they're your "gimmes" and will help unlock other cells!
            </Typography.Caption>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg">
            <Typography.Paragraph className="font-semibold text-accent">
              Stay Calm and Logical
            </Typography.Paragraph>
            <Typography.Caption>
              Don't guess! Every Sudoku has a unique solution that can be found
              through logic alone. If you're stuck, take a break and come back
              with fresh eyes.
            </Typography.Caption>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Typography.H2 className="text-accent">Do you know..</Typography.H2>
        <div className="space-y-4">
          <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-accent">
            <Typography.Caption className="">
              There are{" "}
              <strong className="text-accent">
                6,670,903,752,021,072,936,960
              </strong>{" "}
              possible Sudoku grids! That's more than{" "}
              <strong className="text-accent">6 sextillion</strong> - you'll
              never run out of puzzles to solve!
            </Typography.Caption>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-accent">
            <Typography.Caption>
              The world record for solving a Sudoku is{" "}
              <strong className="text-accent">
                1 minute and 23.93 seconds
              </strong>
              , set by Thomas Snyder in 2006. Meanwhile, most of us are still
              figuring out where the 7 goes!
            </Typography.Caption>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-accent">
            <Typography.Caption>
              Studies suggest that solving Sudoku can help improve memory,
              concentration, and logical thinking. It's like yoga for your
              brain!
            </Typography.Caption>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-accent">
            <Typography.Caption>
              Sudoku was one of the first puzzle games to make the successful
              transition from paper to digital, with millions of apps downloaded
              worldwide.
            </Typography.Caption>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg border-l-4 border-accent">
            <Typography.Caption>
              The minimum number of clues needed for a valid Sudoku is{" "}
              <strong className="text-accent">17</strong>. Any fewer and there
              would be multiple solutions - which breaks the cardinal rule of
              Sudoku!
            </Typography.Caption>
          </div>
        </div>
      </div>

      <Typography.Paragraph>
        Ready to test your skills? The puzzle is waiting for you! Remember:
        every expert was once a beginner. Happy solving!
      </Typography.Paragraph>
    </div>
  );
}
