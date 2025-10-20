import type {
  ChangeOutputsDto,
  ChangeSetPointsDto,
  ControlLoopDto,
  PicoUnit,
  UpdatePicoUnitDto,
} from '~api/generated';

export type PicoUnitCtx = {
  pico?: PicoUnit;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
  updatePico: {
    mutate: (vars: { picoUnitId: number; body: Partial<UpdatePicoUnitDto> }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: Partial<UpdatePicoUnitDto> }) => Promise<any>;
    isLoading: boolean;
  };
  deletePico: {
    mutate: (id: number) => void;
    mutateAsync: (id: number) => Promise<any>;
    isLoading: boolean;
  };
  toggleControlLoop?: {
    mutate: (vars: { picoUnitId: number; body: ControlLoopDto }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: ControlLoopDto }) => Promise<any>;
    isLoading: boolean;
  };
  changeTargets?: {
    mutate: (vars: { picoUnitId: number; body: ChangeSetPointsDto }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: ChangeSetPointsDto }) => Promise<any>;
    isLoading: boolean;
  };
  changeOutputs?: {
    mutate: (vars: { picoUnitId: number; body: ChangeOutputsDto }) => void;
    mutateAsync: (vars: { picoUnitId: number; body: ChangeOutputsDto }) => Promise<any>;
    isLoading: boolean;
  };
};
